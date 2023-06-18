import pool from '../middleware/databasePool.js'
const tweetController = {
  getHome: async (req, res, next) => {
    const [data, fields] = await pool.execute(`
    SELECT tweets.*, users.name, users.avatar
    FROM tweets
    JOIN users ON tweets.user_id = users.id
    WHERE tweets.id NOT IN (
      SELECT tweet_id FROM hidden_tweets WHERE user_id = ${res.locals.userId}
    )
    ORDER BY tweets.updated_at DESC;
    `)
    console.log(data.length)
    console.log(res.locals.userId)
    res.render('tweets', { tweets: data })
  },
}
export default tweetController
