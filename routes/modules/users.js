import { Router } from 'express'
import userController from '../../controllers/userController.js'
const router = Router()

router.get('/signup', userController.getSignUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.getSignInPage)
router.post('/signin', userController.signIn)
router.get('/logout', userController.logout)

export default router
