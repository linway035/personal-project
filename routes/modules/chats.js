import { Router } from 'express'
import chatController from '../../controllers/chatController.js'
import authenticate from '../../middleware/auth.js'
const router = Router()

router.get('/rooms', chatController.getRoomList)
router.get('/messages/:roomId', chatController.getRoomMessages)
router.get('/', chatController.getApi)

export default router
