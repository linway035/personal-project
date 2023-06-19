import { Router } from 'express'
import userController from '../../controllers/userController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.get('/signup', userController.getSignUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.getSignInPage)
router.post('/signin', userController.signIn)
router.get('/logout', userController.logout)

router.get('/:id/profile', authenticate, userController.getProfilePage)
// router.get('/:id/followings', userController.getUserFollowings)
// router.get('/:id/followers', userController.getUserFollowers)

export default router
