import { Router } from 'express'
import users from './modules/users.js'
import tweets from './modules/tweets.js'
import tweetController from '../controllers/tweetController.js'
import followshipController from '../controllers/followshipController.js'
import generalErrorHandler from '../middleware/error-handler.js'
import authenticate from '../middleware/auth.js'
const router = Router()

router.use('/users', users)
router.use('/tweets', tweets)
router.post(
  '/followships/:id',
  authenticate,
  followshipController.unFollowships
)
router.post('/followships', authenticate, followshipController.postFollowships)
router.use('/home', authenticate, tweetController.getHome) //, authenticate
router.get('/', (req, res) => {
  res.redirect('/home')
})
router.use('/', generalErrorHandler)

export default router
