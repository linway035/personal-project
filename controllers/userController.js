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
        'SELECT * FROM users WHERE email = ?',
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
        'SELECT * FROM users WHERE email = ?',
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

    const [tweets] = await pool.execute(
      `
        SELECT tweets.*, users.name, users.avatar, 
        IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
        IF(MAX(tl.user_id) IS NULL, 0, 1) AS is_liked,
        GROUP_CONCAT(tweet_images.image_path) AS images
        FROM tweets
        JOIN users ON tweets.user_id = users.id
        LEFT JOIN (
          SELECT tweet_id, COUNT(*) AS count
          FROM tweet_likes
          WHERE is_active = 1
          GROUP BY tweet_id
        ) AS like_counts ON tweets.id = like_counts.tweet_id
        LEFT JOIN (
          SELECT t.id AS tweet_id, COUNT(r.id) AS count
          FROM tweets AS t
          LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id IS NULL
          WHERE r.is_active = 1
          GROUP BY t.id
        ) AS reply_counts ON tweets.id = reply_counts.tweet_id
        LEFT JOIN (
          SELECT * FROM tweet_likes WHERE user_id = ? AND is_active = 1
        ) AS tl ON tweets.id = tl.tweet_id
        LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
        WHERE tweets.is_active = 1 AND tweets.user_id = ? AND tweets.id NOT IN (
          SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
        )
        GROUP BY tweets.id
        ORDER BY tweets.updated_at DESC
      `,
      [currentUserID, userId, currentUserID]
    )

    const tweetsWithImages = tweets.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })

    res.render('userprofile', {
      userProfile,
      isCurrentUser,
      user: currentUserData,
      tweets: tweetsWithImages,
    })
  },
  getUserFollowings: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const [currentUser] = await pool.execute(
        `
        SELECT id, name, avatar FROM users WHERE id =?`,
        [currentUserID]
      )
      const currentUserData = currentUser[0]
      const userId = req.params.id
      const [pageUser] = await pool.execute(
        `SELECT id, name from users WHERE id =?`,
        [userId]
      )
      const pageUserData = pageUser[0]
      const [users] = await pool.execute(
        `
      SELECT u.id, u.name, u.avatar, u.bio, IF(f.following_id IS NULL, 0, 1) AS is_following
      FROM users u
      LEFT JOIN followships f ON f.following_id = u.id AND f.follower_id = ? AND f.is_active = 1
      WHERE u.id IN 
      (SELECT following_id FROM followships WHERE follower_id=? AND is_active=1)
      ORDER BY u.name ASC`,
        [currentUserID, userId]
      )
      res.render('userfollowings', {
        users,
        pageUserData,
        user: currentUserData,
      })
    } catch (error) {
      next(error)
    }
  },
  getUserFollowingsAPI: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const userId = req.params.id
      const [users] = await pool.execute(
        `
      SELECT u.id, u.name, u.avatar, u.bio, IF(f.following_id IS NULL, 0, 1) AS is_following
      FROM users u
      LEFT JOIN followships f ON f.following_id = u.id AND f.follower_id = ? AND f.is_active = 1
      WHERE u.id IN 
      (SELECT following_id FROM followships WHERE follower_id=? AND is_active=1)
      ORDER BY u.name ASC`,
        [currentUserID, userId]
      )
      return res.json(users)
    } catch (error) {
      next(error)
    }
  },
  getUserFollowers: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const [currentUser] = await pool.execute(
        `
        SELECT id, name, avatar FROM users WHERE id =?`,
        [currentUserID]
      )
      const currentUserData = currentUser[0]
      const userId = req.params.id
      const [pageUser] = await pool.execute(
        `SELECT id, name from users WHERE id =?`,
        [userId]
      )
      const pageUserData = pageUser[0]
      const [users] = await pool.execute(
        `
      SELECT u.id, u.name, u.avatar, u.bio, IF(f.following_id IS NULL, 0, 1) AS is_following
      FROM users u
      LEFT JOIN followships f ON f.following_id = u.id AND f.follower_id = ? AND f.is_active = 1
      WHERE u.id IN 
      (SELECT follower_id FROM followships WHERE following_id=? AND is_active=1)
      ORDER BY u.name ASC`,
        [currentUserID, userId]
      )
      res.render('userfollowers', {
        users,
        pageUserData,
        user: currentUserData,
      })
    } catch (error) {
      next(error)
    }
  },
  getUserTweetsAPI: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const userId = req.params.id
      const [tweets] = await pool.execute(
        `
        SELECT tweets.*, users.name, users.avatar, 
        IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
        IF(MAX(tl.user_id) IS NULL, 0, 1) AS is_liked,
        GROUP_CONCAT(tweet_images.image_path) AS images
        FROM tweets
        JOIN users ON tweets.user_id = users.id
        LEFT JOIN (
          SELECT tweet_id, COUNT(*) AS count
          FROM tweet_likes
          WHERE is_active = 1
          GROUP BY tweet_id
        ) AS like_counts ON tweets.id = like_counts.tweet_id
        LEFT JOIN (
          SELECT t.id AS tweet_id, COUNT(r.id) AS count
          FROM tweets AS t
          LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id IS NULL
          WHERE r.is_active = 1
          GROUP BY t.id
        ) AS reply_counts ON tweets.id = reply_counts.tweet_id
        LEFT JOIN (
          SELECT * FROM tweet_likes WHERE user_id = ? AND is_active = 1
        ) AS tl ON tweets.id = tl.tweet_id
        LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
        WHERE tweets.is_active = 1 AND tweets.user_id = ?
        GROUP BY tweets.id
        ORDER BY tweets.updated_at DESC
      `,
        [currentUserID, userId]
      )
      const tweetsWithImages = tweets.map(tweet => {
        if (tweet.images) {
          tweet.images = tweet.images.split(',').map(image => {
            if (image.startsWith('https://')) {
              return image
            } else {
              return `\\${image}`
            }
          })
        } else {
          tweet.images = []
        }
        return tweet
      })

      console.log(tweetsWithImages)
      res.json(tweetsWithImages)
    } catch (error) {
      next(error)
    }
  },
  getUserReplies: async (req, res, next) => {
    try {
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
      const [replies] = await pool.execute(
        `
        SELECT r.*, t.user_id as tweet_user_id, u.name as tweet_user_name FROM replies r
        LEFT JOIN tweets t on r.tweet_id=t.id
        LEFT JOIN users u on t.user_id=u.id
        where r.user_id =? AND r.is_active=1 AND t.is_active=1
        ORDER BY r.updated_at DESC;
      `,
        [userId]
      )
      res.render('userreplies', {
        userProfile,
        isCurrentUser,
        user: currentUserData,
        replies,
      })
    } catch (error) {
      next(error)
    }
  },
  getUserLikes: async (req, res, next) => {
    try {
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
      const [tweets] = await pool.execute(
        `
        SELECT tweets.*, users.name, users.avatar, 
        IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
        IF(MAX(tl.user_id) IS NULL, 0, 1) AS is_liked,
        GROUP_CONCAT(tweet_images.image_path) AS images,
        tll.updated_at as like_date
        FROM tweets
        JOIN users ON tweets.user_id = users.id
        LEFT JOIN (
          SELECT tweet_id, COUNT(*) AS count
          FROM tweet_likes
          WHERE is_active = 1
          GROUP BY tweet_id
        ) AS like_counts ON tweets.id = like_counts.tweet_id
        LEFT JOIN (
          SELECT t.id AS tweet_id, COUNT(r.id) AS count
          FROM tweets AS t
          LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id IS NULL
          WHERE r.is_active = 1
          GROUP BY t.id
        ) AS reply_counts ON tweets.id = reply_counts.tweet_id
        LEFT JOIN (
          SELECT * FROM tweet_likes WHERE user_id = ? AND is_active = 1
        ) AS tl ON tweets.id = tl.tweet_id
        LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
        LEFT JOIN (
          SELECT * FROM tweet_likes where user_id =? and is_active=1
        ) AS tll ON tweets.id = tll.tweet_id
        WHERE tweets.is_active = 1 AND tweets.id IN(
          SELECT tweet_id FROM tweet_likes where user_id =? and is_active=1
        ) AND tweets.id NOT IN (
          SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
        )
        GROUP BY tweets.id, tll.updated_at
        ORDER BY like_date DESC
      `,
        [currentUserID, userId, userId, currentUserID]
      )
      const tweetsWithImages = tweets.map(tweet => {
        if (tweet.images) {
          tweet.images = tweet.images.split(',').map(image => {
            if (image.startsWith('https://')) {
              return image
            } else {
              return `\\${image}`
            }
          })
        } else {
          tweet.images = []
        }
        return tweet
      })

      res.render('userlikes', {
        userProfile,
        isCurrentUser,
        user: currentUserData,
        tweets: tweetsWithImages,
      })
    } catch (error) {
      next(error)
    }
  },
}

export default userController
