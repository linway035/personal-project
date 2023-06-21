import pool from '../middleware/databasePool.js'

const getUser = async (req, res, next) => {
  const currentUserID = res.locals.userId
  const [currentUser] = await pool.execute(`
    SELECT id, name, avatar FROM users WHERE id =${currentUserID}`)
  console.log(currentUser[0])
  return currentUser[0]
}

async function transformData() {
  const [data] = await pool.query(
    `SELECT tweet_id, user_id, rating FROM ratings`
  )
  const [usersCount] = await pool.query(
    `SELECT MAX(id) AS usersCount FROM users`
  )
  const [tweetsCount] = await pool.query(
    `SELECT MAX(id) AS tweetsCount FROM tweets`
  )
  const usersLength = usersCount[0].usersCount
  const tweetsLength = tweetsCount[0].tweetsCount

  const transformedData = {}

  // Initialize the transformed data object with empty arrays for each user
  for (let user_id = 1; user_id <= usersLength; user_id++) {
    transformedData[user_id] = Array(tweetsLength).fill(null)
  }

  // Populate the transformed data with ratings
  data.forEach(({ tweet_id, user_id, rating }) => {
    transformedData[user_id][tweet_id - 1] = rating
  })

  return transformedData
}

// const matrix = await transformData()
// console.log(matrix)

const calculateSimilarity = (user1, user2, ratings) => {
  const commonIndices = Object.keys(ratings[user1]).filter(
    index => ratings[user1][index] !== null && ratings[user2][index] !== null
  )
  // console.log('commonIndices', commonIndices)

  const numerator = commonIndices.reduce(
    (sum, index) => sum + ratings[user1][index] * ratings[user2][index],
    0
  )
  // console.log('numerator', numerator)
  const denominatorUser1 = Math.sqrt(
    commonIndices.reduce(
      (sum, index) => sum + Math.pow(ratings[user1][index], 2),
      0
    )
  )
  const denominatorUser2 = Math.sqrt(
    commonIndices.reduce(
      (sum, index) => sum + Math.pow(ratings[user2][index], 2),
      0
    )
  )
  // console.log(
  //   'denominatorUser1',
  //   denominatorUser1,
  //   'denominatorUser2',
  //   denominatorUser2
  // )
  return numerator / (denominatorUser1 * denominatorUser2)
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

    // 取推文
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
    `,
      [currentUserID, currentUserID, currentUserID, currentUserID]
    ) //ORDER LIMIT pending

    // 取推薦
    const userId = res.locals.userId
    const similarityResults = {}
    for (let user in matrix) {
      if (user !== userId.toString()) {
        similarityResults[user] = calculateSimilarity(
          userId.toString(),
          user,
          matrix
        )
      }
    }
    const sortedResults = Object.entries(similarityResults).sort((a, b) => {
      // 由高到低
      if (!isNaN(b[1]) && !isNaN(a[1])) {
        return b[1] - a[1]
      }
      // NaN放後面
      if (isNaN(b[1]) || isNaN(a[1])) {
        return isNaN(b[1]) ? -1 : 1
      }
      // 相同則id大優先
      return parseInt(b[0]) - parseInt(a[0])
    })
    const sortedUserIds = sortedResults.map(([userId]) => parseInt(userId))
    const userIdsStr = sortedUserIds.join(',')
    console.log(userIdsStr)

    const [follows] = await pool.execute(
      `
      SELECT id, name, avatar FROM users WHERE id NOT IN
      (SELECT following_id FROM followships WHERE follower_id=? 
        AND followships.is_active=1)
      AND id <> ?
      ORDER BY FIELD(id,${userIdsStr})
      LIMIT 5;   
      `,
      [currentUserID, currentUserID]
    )

    console.log(follows) //array of objects

    res.render('tweets', { tweets: data, user: currentUserData, follows })
  },
  getForYouPage: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    // 取推文
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
    ORDER BY tweets.updated_at DESC
    `,
      [currentUserID, currentUserID, currentUserID, currentUserID]
    ) //ORDER LIMIT pending

    // 取推薦
    const matrix = await transformData() //若放在最外層則不會更新
    // console.log(matrix)
    // console.table(Object.values(matrix))
    const userId = res.locals.userId
    const similarityResults = {}
    // console.log(typeof userId.toString())
    // console.log('jj', calculateSimilarity(8, 15, matrix))
    for (let user in matrix) {
      if (user !== userId.toString()) {
        // console.log('yy', user, typeof user)
        similarityResults[user] = calculateSimilarity(
          userId.toString(),
          user,
          matrix
        )
      }
    }
    // const similarityResultsCopy = { ...similarityResults }
    console.log('similarityResults', similarityResults)
    // console.log(similarityResultsCopy)
    const sortedResults = Object.entries(similarityResults).sort((a, b) => {
      // 由高到低
      if (!isNaN(b[1]) && !isNaN(a[1])) {
        return b[1] - a[1]
      }
      // NaN放後面
      if (isNaN(b[1]) || isNaN(a[1])) {
        return isNaN(b[1]) ? -1 : 1
      }
      // 相同則id大優先
      return parseInt(b[0]) - parseInt(a[0])
    })
    const sortedUserIds = sortedResults.map(([userId]) => parseInt(userId))
    const userIdsStr = sortedUserIds.join(',')
    console.log(userIdsStr)

    const [follows] = await pool.execute(
      `
      SELECT id, name, avatar FROM users WHERE id NOT IN
      (SELECT following_id FROM followships WHERE follower_id=? 
        AND followships.is_active=1)
      AND id <> ?
      ORDER BY FIELD(id,${userIdsStr})
      LIMIT 5;   
      `,
      [currentUserID, currentUserID]
    )

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

    // 取推薦
    const userId = res.locals.userId
    const similarityResults = {}
    for (let user in matrix) {
      if (user !== userId.toString()) {
        similarityResults[user] = calculateSimilarity(
          userId.toString(),
          user,
          matrix
        )
      }
    }
    const sortedResults = Object.entries(similarityResults).sort((a, b) => {
      // 由高到低
      if (!isNaN(b[1]) && !isNaN(a[1])) {
        return b[1] - a[1]
      }
      // NaN放後面
      if (isNaN(b[1]) || isNaN(a[1])) {
        return isNaN(b[1]) ? -1 : 1
      }
      // 相同則id大優先
      return parseInt(b[0]) - parseInt(a[0])
    })
    const sortedUserIds = sortedResults.map(([userId]) => parseInt(userId))
    const userIdsStr = sortedUserIds.join(',')
    console.log(userIdsStr)

    const [follows] = await pool.execute(
      `
      SELECT id, name, avatar FROM users WHERE id NOT IN
      (SELECT following_id FROM followships WHERE follower_id=? 
        AND followships.is_active=1)
      AND id <> ?
      ORDER BY FIELD(id,${userIdsStr})
      LIMIT 5;   
      `,
      [currentUserID, currentUserID]
    )
    console.log(follows)

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
