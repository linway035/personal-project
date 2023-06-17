import { Router } from 'express'
import users from './modules/users.js'
const router = Router()

router.use('/users', users)
router.use('/home', (req, res) => res.send('hi'))
router.get('/', (req, res) => {
  res.redirect('/home')
})

export default router
