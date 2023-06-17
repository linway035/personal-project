import pool from '../middleware/databasePool.js'

const userController = {
  getSignUpPage: async (req, res, next) => {
    res.render('signup')
  },
}

export default userController
