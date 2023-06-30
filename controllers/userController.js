import pool from '../middleware/databasePool.js'
import bcrypt from 'bcryptjs'
import { signJWT, verifyJWT } from '../middleware/JWT.js'
const saltRounds = 10

const userController = {
  getSignUpPage: async (req, res, next) => {
    res.render('signup')
  },
  signUp: async (req, res, next) => {
    try {
      let { provider, avatar, cover } = req.body
      const name = req.body.name.trim()
      const email = req.body.email.trim()
      const password = req.body.password
      const checkPassword = req.body.checkPassword
      if (!name || !email || !password || !checkPassword) {
        throw new Error('All required')
      }
      if (password !== checkPassword) {
        throw new Error('密碼和確認密碼不一致!')
      }
      const [users, fields] = await pool.execute(
        'SELECT * FROM Users WHERE email = ?',
        [email]
      )
      if (users.length !== 0) {
        throw new Error('Email already exists!')
      }
      const hash = await bcrypt.hash(req.body.password, saltRounds)
      provider = provider || 'native'
      const firstLetter = name[0]
      avatar =
        avatar ||
        `https://fakeimg.pl/200x200/AAB8C2,128/000,255/?text=${firstLetter}&font=noto`
      cover = cover || 'https://fakeimg.pl/1500x600/6495ED/6495ED'
      const [insert] = await pool.execute(
        'INSERT INTO users (provider, email, password, name, avatar, cover) VALUES (?, ?, ?, ?, ?, ?)',
        [provider, email, hash, name, avatar, cover]
      )
      // console.log(insert)
      // ResultSetHeader {
      //   fieldCount: 0,
      //   affectedRows: 1,
      //   insertId: 1,
      //   info: '',
      //   serverStatus: 2,
      //   warningStatus: 0
      // }
      const userId = insert.insertId
      const token = await signJWT(insert.insertId)
      res.cookie('jwtToken', token).json({ userId, name })
    } catch (error) {
      next(error)
    }
  },
  getSignInPage: async (req, res, next) => {
    res.render('signin')
  },
  signIn: async (req, res, next) => {
    try {
      const email = req.body.email.trim()
      const password = req.body.password
      if (!email || !password)
        throw new Error('Email and Password are required')
      const [user, fields] = await pool.execute(
        'SELECT * FROM Users WHERE email = ?',
        [email]
      )
      if (!user.length) throw new Error('User not exist')
      const isPasswordCorrect = bcrypt.compareSync(password, user[0].password)
      if (!isPasswordCorrect) throw new Error('Invalid password')
      const token = await signJWT(user[0].id)
      res.cookie('jwtToken', token).json({
        userId: user[0].id,
        name: user[0].name,
        avatar: user[0].avatar,
      })
    } catch (error) {
      next(error)
    }
  },
  logout: async (req, res, next) => {
    res.clearCookie('jwtToken').redirect('/users/signin')
  },
  getProfilePage: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    const userId = req.params.id
    const [user] = await pool.execute(
      `
    SELECT u.*, IF(f.following_id IS NULL, 0, 1) AS is_following,
  (SELECT COUNT(*) FROM followships WHERE following_id = u.id AND is_active = 1) AS followers_count,
    (SELECT COUNT(*) FROM followships WHERE follower_id = u.id AND is_active = 1) AS following_count
    FROM users AS u
    LEFT JOIN (
      SELECT following_id
      FROM followships
      WHERE follower_id = ? AND is_active = 1
    ) AS f ON u.id = f.following_id
    WHERE u.id =?`,
      [currentUserID, userId]
    )
    const userProfile = user[0]
    const isCurrentUser = userProfile.id === currentUserID

    const [follows] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id NOT IN
    (SELECT following_id FROM followships WHERE follower_id=? 
      AND followships.is_active=1)
    AND id <> ?
    ORDER BY users.created_at DESC
    LIMIT 3;   
    `,
      [currentUserID, currentUserID]
    ) //order pending

    res.render('userprofile', {
      userProfile,
      isCurrentUser,
      user: currentUserData,
      follows,
    })
  },
}

export default userController
