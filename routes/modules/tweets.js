import { Router } from 'express'
import tweetController from '../../controllers/tweetController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.post('/:id/like', authenticate, tweetController.postLike)
router.post('/:id/unlike', authenticate, tweetController.postUnlike)
router.post('/:id/replies', authenticate, tweetController.postReply)
// router.get('/:id/replies', authenticate, tweetController.getTweet)

export default router
