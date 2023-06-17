import pool from '../middleware/databasePool.js'
const tweetController = {
  getHome: async (req, res, next) => {
    res.render('tweets')
  },
}
export default tweetController
