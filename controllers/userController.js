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
      const token = await signJWT(insert.insertId)
      res.cookie('jwtToken', token).redirect('/')
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
      const token = await signJWT(user.id)
      res.cookie('jwtToken', token).redirect('/')
    } catch (error) {
      next(error)
    }
  },
}

export default userController
