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
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    const [data, fields] = await pool.execute(
      `
    SELECT tweets.*, users.name, users.avatar, 
    IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
    IF(tl.user_id IS NULL, 0, 1) AS is_liked
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
      LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id IS NULL
      WHERE r.is_active = 1
      GROUP BY t.id
    ) AS reply_counts ON tweets.id = reply_counts.tweet_id
    LEFT JOIN (
      SELECT * FROM tweet_likes WHERE user_id = ? AND is_active = 1
    ) AS tl ON tweets.id = tl.tweet_id
    WHERE tweets.is_active = 1
      AND tweets.id NOT IN (
        SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
    )
    AND (tweets.user_id IN (
      SELECT following_id FROM followships WHERE follower_id = ?
    ) OR tweets.user_id = ?)
    ORDER BY tweets.updated_at DESC
    LIMIT 6;
    `,
      [currentUserID, currentUserID, currentUserID, currentUserID]
    ) //ORDER LIMIT pending

    const [follows] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id NOT IN
    (SELECT following_id FROM followships WHERE follower_id=? 
      AND followships.is_active=1)
    AND id <> ?
    ORDER BY users.created_at DESC
    LIMIT 3;   
    `,
      [currentUserID, currentUserID]
    ) //order pending

    // console.log(follows) //array of objects

    res.render('tweets', { tweets: data, user: currentUserData, follows })
  },
  postLike: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      //若違反唯一性約束條件，則觸發重複鍵更新的邏輯
      await pool.execute(
        `INSERT INTO tweet_likes (user_id, tweet_id, is_active, updated_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()`,
        [currentUserID, tweetId]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  postUnlike: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      //MySQL不允許在 UPDATE查詢中直接使用來自相同表格的子查詢，故改間接
      await pool.execute(
        `UPDATE tweet_likes
        SET is_active = 0, updated_at = NOW()
        WHERE id IN (
          SELECT id
          FROM (
            SELECT tl.id
            FROM tweet_likes AS tl
            WHERE tl.user_id = ? AND tl.tweet_id = ?
            LIMIT 1
          ) AS subquery
        )`,
        [currentUserID, tweetId]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  postReply: async (req, res, next) => {
    try {
      const tweetId = req.params.id
      const currentUserID = res.locals.userId
      const content = req.body.comment
      if (!content) {
        req.flash('error_messages', '內容不可空白')
        res.redirect('back')
      }
      await pool.execute(
        `
      INSERT INTO replies (tweet_id, user_id, content, parent_id, path)
      VALUES (?,?,?,?,?)`,
        [tweetId, currentUserID, content, null, tweetId]
      ) //parent_id,path,PENDING
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  getTweetPage: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    const [data, fields] = await pool.execute(
      `SELECT tweets.*, users.name, users.avatar, IFNULL(like_counts.count, 0) AS like_count, 
      IFNULL(reply_counts.count, 0) AS reply_count, IF(tl.user_id IS NULL, 0, 1) AS is_liked
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
        LEFT JOIN replies AS r ON t.id = r.tweet_id AND r.parent_id IS NULL
        WHERE r.is_active = 1
        GROUP BY t.id
      ) AS reply_counts ON tweets.id = reply_counts.tweet_id
      LEFT JOIN (
        SELECT * FROM tweet_likes WHERE user_id = ? AND is_active = 1
      ) AS tl ON tweets.id = tl.tweet_id
      WHERE tweets.id = ?`,
      [currentUserID, tweetId]
    )
    if (data.length === 0) {
      throw new Error('找不到該推文')
    }
    const tweet = data[0]
    const [follows] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id NOT IN
    (SELECT following_id FROM followships WHERE follower_id=? 
      AND followships.is_active=1)
    AND id <> ?
    ORDER BY users.created_at DESC
    LIMIT 3;   
    `,
      [currentUserID, currentUserID]
    ) //order pending

    const [replies] = await pool.execute(
      `
    SELECT replies.*, users.name, users.avatar 
    FROM replies
    JOIN users ON replies.user_id = users.id
    WHERE tweet_id = ? AND is_active = 1;
    `,
      [tweetId]
    )
    // console.log(replies) //array of objects
    res.render('tweet', { tweet, follows, replies })
  },
  postTweet: async (req, res, next) => {
    try {
      const { description } = req.body
      const currentUserID = res.locals.userId
      if (description.length > 140) {
        throw new Error('請以 140 字以內為限')
      } else if (description.trim() === '') {
        throw new Error('內容不可空白')
      }
      await pool.execute(
        `INSERT INTO tweets (user_id, content)
        VALUES (?, ?)
        `,
        [currentUserID, description]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  postHidden: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      await pool.execute(
        `INSERT INTO hidden_tweets (user_id, tweet_id)
        VALUES (?, ?)
        `,
        [currentUserID, tweetId]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  postRating: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    const rating = req.body.rating
    try {
      await pool.execute(
        `INSERT INTO ratings (user_id, tweet_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ? , updated_at = NOW();
        `,
        [currentUserID, tweetId, rating, rating]
      )
      // res.redirect('back')
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },
  getRating: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      const [rows, fields] = await pool.execute(
        `SELECT rating FROM ratings WHERE tweet_id=? AND user_id=?
        `,
        [tweetId, currentUserID]
      )
      const rating = rows[0]?.rating || null //給前端判斷null情況
      // res.redirect('back')
      res.status(200).json({ rating })
    } catch (error) {
      next(error)
    }
  },
  deleteRating: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      await pool.execute(
        `DELETE FROM ratings WHERE tweet_id=? and user_id=?;
        `,
        [tweetId, currentUserID]
      )
      // res.redirect('back')
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },
}
export default tweetController
