import { Router } from 'express'
import userController from '../../controllers/userController.js'
import authenticate from '../../middleware/auth.js'
import upload from '../../middleware/multer.js'
const router = Router()

router.get('/signup', userController.getSignUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.getSignInPage)
router.post('/signin', userController.signIn)
router.get('/logout', authenticate, userController.logout)
router.get('/:id/followings', authenticate, userController.getUserFollowings)
router.get('/:id/followers', authenticate, userController.getUserFollowers)
router.get(
  '/:id/followings/api',
  authenticate,
  userController.getUserFollowingsAPI
) //未
router.get('/:id/tweets', authenticate, userController.getUserTweetsAPI) //未
router.get('/:id/replies', authenticate, userController.getUserReplies)
router.get('/:id/likes', authenticate, userController.getUserLikes)
router.get('/:id/profile', authenticate, userController.getProfilePage)
router.get('/edit/:id', authenticate, userController.getUserInfo)
router.post(
  '/edit/:id',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
  ]),
  authenticate,
  userController.postUserInfo
)
export default router
