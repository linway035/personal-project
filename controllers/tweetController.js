import pool from '../middleware/databasePool.js'

const getUser = async (req, res, next) => {
  const currentUserID = res.locals.userId
  const [currentUser] = await pool.execute(`
    SELECT id, name, avatar FROM users WHERE id =${currentUserID}`)
  console.log(currentUser[0])
  return currentUser[0]
}

const tweetController = {
  getHome: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(`
    SELECT id, name, avatar FROM users WHERE id =${currentUserID}`)
    // console.log(currentUser[0])
    const currentUserData = currentUser[0]

    const [data, fields] = await pool.execute(`
    SELECT tweets.*, users.name, users.avatar, 
    IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count
    FROM tweets
    JOIN users ON tweets.user_id = users.id
    LEFT JOIN (
      SELECT tweet_id, COUNT(*) AS count
      FROM tweet_likes
      WHERE is_active = 1
      GROUP BY tweet_id
    ) AS like_counts ON tweets.id = like_counts.tweet_id
    LEFT JOIN (
      SELECT t.id AS tweet_id, COUNT(r.id) AS count
      FROM tweets AS t
      LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id = r.id
      WHERE r.is_active = 1
      GROUP BY t.id
    ) AS reply_counts ON tweets.id = reply_counts.tweet_id
    WHERE tweets.is_active = 1
      AND tweets.id NOT IN (
        SELECT tweet_id FROM hidden_tweets WHERE user_id = ${currentUserID}
    )
    ORDER BY tweets.updated_at DESC;
    `)

    const [follows] = await pool.execute(`
    SELECT id, name, avatar FROM users WHERE id NOT IN
    (SELECT following_id FROM followships WHERE follower_id=${currentUserID} 
      AND followships.is_active=1)
    AND id <> ${currentUserID}
    ORDER BY users.created_at DESC
    LIMIT 3;   
    `) //order depending

    // console.log(follows) //array of objects

    res.render('tweets', { tweets: data, user: currentUserData, follows })
  },
}
export default tweetController
