import { Router } from 'express'
import followshipController from '../../controllers/followshipController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.post(
  '/profile/:id',
  authenticate,
  followshipController.unProfileFollowships
)
router.post(
  '/profile',
  authenticate,
  followshipController.postProfileFollowships
)
router.post('/:id', authenticate, followshipController.unFollowships)
router.post('/', authenticate, followshipController.postFollowships)

export default router
