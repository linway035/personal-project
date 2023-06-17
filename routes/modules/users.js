import { Router } from 'express'
import userController from '../../controllers/userController.js'
const router = Router()

router.get('/signup', userController.getSignUpPage)
router.post('/signup', userController.signUp)

export default router
