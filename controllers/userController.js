import pool from '../middleware/databasePool.js'
import * as userModel from '../models/user.js'
import * as tweetModel from '../models/tweet.js'
import tweetHelpers from '../helpers/tweet-helpers.js'
import bcrypt from 'bcryptjs'
import { signJWT } from '../middleware/JWT.js'
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
      if (name.length > 21) {
        throw new Error('名字請不要超過20字')
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
      if (!email || !password) {
        throw new Error('Email and Password are required')
      }
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
        avatar: user[0].avatar
      })
    } catch (error) {
      next(error)
    }
  },
  logout: async (req, res, next) => {
    res.clearCookie('jwtToken').redirect('/users/signin')
  },
  getProfilePage: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)

      const userId = req.params.id
      const user = await userModel.getProfilePageData(currentUserID, userId)
      if (user.length === 0) {
        res.render('404', { message: 'This account doesn’t exist' })
        return
      }
      const userProfile = user[0]
      const isCurrentUser = userProfile.id === currentUserID

      const tweets = await tweetModel.getTweetsOfOneUser(currentUserID, userId)
      const tweetsWithImages = await tweetHelpers.joinTweetsWithImages(tweets)

      res.render('userprofile', {
        userProfile,
        isCurrentUser,
        user: currentUserData,
        tweets: tweetsWithImages
      })
    } catch (error) {
      next(error)
    }
  },
  getUserFollowings: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)
      const userId = req.params.id
      const pageUser = await userModel.getPageUserData(userId)
      if (pageUser.length === 0) {
        res.render('404', { message: 'This account doesn’t exist' })
        return
      }
      const pageUserData = pageUser[0]
      const users = await userModel.getUserFollowingsData(currentUserID, userId)
      res.render('userfollowings', {
        users,
        pageUserData,
        user: currentUserData
      })
    } catch (error) {
      next(error)
    }
  },
  getUserFollowers: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)
      const userId = req.params.id
      const pageUser = await userModel.getPageUserData(userId)
      if (pageUser.length === 0) {
        res.render('404', { message: 'This account doesn’t exist' })
        return
      }
      const pageUserData = pageUser[0]

      const users = await userModel.getUserFollowersData(currentUserID, userId)
      res.render('userfollowers', {
        users,
        pageUserData,
        user: currentUserData
      })
    } catch (error) {
      next(error)
    }
  },
  getUserReplies: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)

      const userId = req.params.id
      const user = await userModel.getProfilePageData(currentUserID, userId)
      if (user.length === 0) {
        res.render('404', { message: 'This account doesn’t exist' })
        return
      }
      const userProfile = user[0]
      const isCurrentUser = userProfile.id === currentUserID
      const replies = await userModel.getUserRepliesData(userId)
      res.render('userreplies', {
        userProfile,
        isCurrentUser,
        user: currentUserData,
        replies
      })
    } catch (error) {
      next(error)
    }
  },
  getUserLikes: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)

      const userId = req.params.id
      const user = await userModel.getProfilePageData(currentUserID, userId)
      if (user.length === 0) {
        res.render('404', { message: 'This account doesn’t exist' })
        return
      }
      const userProfile = user[0]
      const isCurrentUser = userProfile.id === currentUserID
      const tweets = await userModel.getUserLikeTweets(currentUserID, userId)
      const tweetsWithImages = await tweetHelpers.joinTweetsWithImages(tweets)

      res.render('userlikes', {
        userProfile,
        isCurrentUser,
        user: currentUserData,
        tweets: tweetsWithImages
      })
    } catch (error) {
      next(error)
    }
  }
}

export default userController
