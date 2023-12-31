import { Router } from 'express'
import users from './modules/users.js'
import tweets from './modules/tweets.js'
import chats from './modules/chats.js'
import followships from './modules/followships.js'

import tweetController from '../controllers/tweetController.js'
import generalErrorHandler from '../middleware/error-handler.js'
import authenticate from '../middleware/auth.js'
const router = Router()

router.use('/users', users)
router.use('/tweets', tweets)
router.use('/chats', chats)
router.use('/followships', followships)

router.get(
  '/search/people/api',
  authenticate,
  tweetController.getUsersByElasticSearch
)
router.get('/search/people', authenticate, tweetController.getSearchUser)
router.get(
  '/search/api',
  authenticate,
  tweetController.getTweetsByElasticSearch
)
router.get('/search', authenticate, tweetController.getSearchTweet)
router.get('/home', authenticate, tweetController.getHome)
router.get('/', (req, res) => {
  res.redirect('/home')
})
router.use('/', generalErrorHandler)

export default router
