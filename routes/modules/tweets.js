import { Router } from 'express'
import tweetController from '../../controllers/tweetController.js'
import authenticate from '../../middleware/auth.js'
import upload from '../../middleware/multer.js'
const router = Router()

router.post('/:id/like', authenticate, tweetController.postLike)
router.post('/:id/unlike', authenticate, tweetController.postUnlike)
router.post('/:id/replies', authenticate, tweetController.postReply)
router.get('/:id/replies', authenticate, tweetController.getTweetPage)
router.post('/:id/hidden', authenticate, tweetController.postHidden)
router.delete('/:id/clearrating', authenticate, tweetController.deleteRating)
router.post('/:id/rating', authenticate, tweetController.postRating)
router.get('/:id/rating', authenticate, tweetController.getRating)
router.get('/foryou', authenticate, tweetController.getForYouPage)
router.get('/follows', authenticate, tweetController.getRecommendUsersAPI)

router.post(
  '/',
  upload.fields([{ name: 'tweetImages', maxCount: 3 }]),
  authenticate,
  tweetController.postTweet
)

export default router
