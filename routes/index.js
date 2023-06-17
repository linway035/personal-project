import { Router } from 'express'
import users from './modules/users.js'
import tweets from './modules/tweets.js'
import tweetController from '../controllers/tweetController.js'
import generalErrorHandler from '../middleware/error-handler.js'
import authenticate from '../middleware/auth.js'
const router = Router()

router.use('/users', users)
router.use('/home', tweetController.getHome) //, authenticate
router.get('/', (req, res) => {
  res.redirect('/home')
})
router.use('/', generalErrorHandler)

export default router
