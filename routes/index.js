import { Router } from 'express'
import users from './modules/users.js'
const router = Router()

router.use('/users', users)
router.use('/', (req, res) => res.send('hi'))

export default router
