import { Router } from 'express'
import users from './modules/users.js'
import generalErrorHandler from '../middleware/error-handler.js'
const router = Router()

router.use('/users', users)
router.use('/home', (req, res) => res.send('hi'))
router.get('/', (req, res) => {
  res.redirect('/home')
})
router.use('/', generalErrorHandler)

export default router
