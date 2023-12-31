import { Router } from 'express'
import chatController from '../../controllers/chatController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.get('/rooms', authenticate, chatController.getRoomList)
router.get('/messages/:roomId', authenticate, chatController.getRoomMessages)
router.post('/receiver', authenticate, chatController.postReceiever)
router.get('/', authenticate, chatController.getChatroom)

export default router
