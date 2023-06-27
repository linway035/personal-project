import { Router } from 'express'
import chatController from '../../controllers/chatController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.get('/', chatController.getApi)

export default router
