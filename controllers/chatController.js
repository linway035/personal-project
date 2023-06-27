import pool from '../middleware/databasePool.js'

const chatController = {
  getApi: async (req, res, next) => {
    res.render('chat')
  },
}

export default chatController
