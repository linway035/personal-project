import pool from './databasePool.js'
import { signJWT, verifyJWT } from './JWT.js'

async function authenticate(req, res, next) {
  try {
    const tokenInHeaders = req.get('Authorization')
    const token = tokenInHeaders?.replace('Bearer ', '') || req.cookies.jwtToken
    if (!token) {
      req.flash('error_messages', '請先登入')
      return res.redirect('/signin')
    }
    const decoded = await verifyJWT(token)
    res.locals.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ errors: 'authenticate failed' })
    next(error)
  }
}

export default authenticate
//導入時 import authenticate from "./authenticate.js";
//或自命名為import auth from "./authenticate.js
//若直接 export async function authenticate，則需import { authenticate } from "./authenticate.js
//若要改則為import { authenticate as auth } from "./authenticate.js";
