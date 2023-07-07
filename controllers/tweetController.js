import pool from '../middleware/databasePool.js'
import { localFileHandler } from '../helpers/file-helpers.js'

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
    transformedData[user_id] = Array(tweetsLength).fill(null) //調參
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
  if (commonIndices.length === 0) {
    return 0
  }

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
  return numerator / (denominatorUser1 * denominatorUser2)
}

const calculateSimilaritySocial = (user1, user2, ratings, socialMatrix) => {
  const commonIndices = Object.keys(ratings[user1]).filter(
    index => ratings[user1][index] !== null && ratings[user2][index] !== null
  )
  // console.log('commonIndices', commonIndices)
  if (commonIndices.length === 0) {
    return 0
  }
  const socialSimilarity =
    socialMatrix[user1][user2] + socialMatrix[user2][user1]
  const similarity =
    socialSimilarity *
    commonIndices.reduce(
      (sum, index) => sum + ratings[user1][index] * ratings[user2][index],
      0
    )

  return similarity
}

const predictRatings = (user, otherUsers, ratings) => {
  const k =
    1 /
    otherUsers.reduce(
      (sum, otherUser) => sum + calculateSimilarity(user, otherUser, ratings),
      0
    )

  const predictedRatings = []
  for (let i = 0; i < ratings[user].length; i++) {
    //若填補值為null則null，0則
    if (ratings[user][i] === null) {
      let similarityWeightedSum = 0
      for (let j = 0; j < otherUsers.length; j++) {
        const similarity = calculateSimilarity(user, otherUsers[j], ratings)
        if (similarity !== 0 && ratings[otherUsers[j]][i] !== null) {
          similarityWeightedSum += similarity * ratings[otherUsers[j]][i]
        }
      }
      predictedRatings.push(k * similarityWeightedSum)
    } else {
      predictedRatings.push(ratings[user][i])
    }
  }
  return predictedRatings
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
    IF(tl.user_id IS NULL, 0, 1) AS is_liked,
    GROUP_CONCAT(tweet_images.image_path) AS images
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
    LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
    WHERE tweets.is_active = 1
      AND tweets.id NOT IN (
        SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
    )
    AND (tweets.user_id IN (
      SELECT following_id FROM followships WHERE follower_id = ?
    ) OR tweets.user_id = ?)
    GROUP BY tweets.id, tweets.user_id, tweets.content, tweets.is_active, tweets.created_at, tweets.updated_at, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id
    ORDER BY tweets.updated_at DESC
    `,
      [currentUserID, currentUserID, currentUserID, currentUserID]
    ) //ORDER LIMIT pending

    const tweetsWithImages = data.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })

    const [replies, others] = await await pool.execute(`
    SELECT
    r.user_id AS reply_user_id,
    u.name AS reply_user_name,
    u.avatar AS reply_user_avatar,
    r.content AS reply_content,
    r.created_at AS reply_created_at,
    t.id AS tweet_id,
    t.user_id AS tweet_user_id,
    tu.name AS tweet_user_name,
    tu.avatar AS tweet_user_avatar
    FROM
        replies AS r
        INNER JOIN tweets AS t ON r.tweet_id = t.id
        INNER JOIN users AS u ON r.user_id = u.id
        INNER JOIN users AS tu ON t.user_id = tu.id
        INNER JOIN followships AS f ON t.user_id = f.following_id
    WHERE
        (f.follower_id = 17 OR t.user_id = 17) -- 替換 YOUR_USER_ID 為您的使用者 ID
        AND r.is_active = 1
        AND t.is_active = 1
        AND f.is_active = 1
    ORDER BY
    r.created_at DESC;
    `)

    const combinedArray = [...tweetsWithImages, ...replies]

    const sortedArray = combinedArray.sort((a, b) => {
      const dateA = new Date(a.created_at || a.reply_created_at)
      const dateB = new Date(b.created_at || b.reply_created_at)
      return dateB - dateA
    })

    res.render('tweets', {
      tweets: sortedArray,
      user: currentUserData,
    })
  },
  getHomeAPI: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId

      // 取推文
      const [data, fields] = await pool.execute(
        `
    SELECT tweets.*, users.name, users.avatar, 
    IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
    IF(tl.user_id IS NULL, 0, 1) AS is_liked,
    GROUP_CONCAT(tweet_images.image_path) AS images
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
    LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
    WHERE tweets.is_active = 1
      AND tweets.id NOT IN (
        SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
    )
    AND (tweets.user_id IN (
      SELECT following_id FROM followships WHERE follower_id = ?
    ) OR tweets.user_id = ?)
    GROUP BY tweets.id, tweets.user_id, tweets.content, tweets.is_active, tweets.created_at, tweets.updated_at, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id
    ORDER BY tweets.updated_at DESC
    `,
        [currentUserID, currentUserID, currentUserID, currentUserID]
      ) //ORDER LIMIT pending

      const tweetsWithImages = data.map(tweet => {
        if (tweet.images) {
          tweet.images = tweet.images.split(',').map(image => {
            if (image.startsWith('https://')) {
              return image
            } else {
              return `\\${image}`
            }
          })
        } else {
          tweet.images = []
        }
        return tweet
      })

      const tweets = tweetsWithImages

      res.status(200).json(tweets)
    } catch (error) {
      console.error('Error retrieving home data:', error)
      res.status(500).json({ message: 'Failed to retrieve home data' })
    }
  },
  getForYouPage: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    // 取推薦人
    const matrix = await transformData() //若放在最外層則不會更新
    // console.log(matrix)
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

    // console.log(userIdsStr)

    //關係矩陣
    const [followMatrix] = await pool.execute(`
      SELECT follower_id, following_id
      FROM followships
      WHERE is_active = 1
    `)
    const [usersLength] = await pool.execute(`SELECT COUNT(*) FROM users`)
    const count = usersLength[0]['COUNT(*)']
    // console.log(followMatrix)
    // 先初始化社交關係矩陣
    const socialMatrix = Array(count)
      .fill(null)
      .map(() => Array(count).fill(0))

    // 遍歷追蹤關係資料，填充社交關係矩陣
    followMatrix.forEach(({ follower_id, following_id }) => {
      socialMatrix[follower_id - 1][following_id - 1] = 1
    })
    // console.log(socialMatrix)

    //推薦文
    const otherUsers = Object.keys(matrix).filter(
      user => parseInt(user) !== userId
    )
    // console.log(otherUsers)
    const predictedRatings = predictRatings(
      userId.toString(),
      otherUsers,
      matrix
    )
    // console.log('hi', predictedRatings)
    const indexedScores = predictedRatings.map((score, index) => ({
      index,
      score,
    }))
    indexedScores.sort((a, b) => b.score - a.score)
    const sortedIndices = indexedScores.map(item => item.index + 1)
    const tweetIDsSorted = sortedIndices.join(',')
    // console.log(tweetIDsSorted)

    // 取推文
    const [data, fields] = await pool.execute(
      `
    SELECT tweets.*, users.name, users.avatar, 
    IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
    IF(tl.user_id IS NULL, 0, 1) AS is_liked,
    GROUP_CONCAT(tweet_images.image_path) AS images
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
    LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
    WHERE tweets.is_active = 1
      AND tweets.id NOT IN (
        SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
    )
    GROUP BY tweets.id, tweets.user_id, tweets.content, tweets.is_active, tweets.created_at, tweets.updated_at, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id
    ORDER BY FIELD(tweets.id, ${tweetIDsSorted})
    `,
      [currentUserID, currentUserID]
    ) //ORDER LIMIT pending
    // console.log(currentUserID, data[0])

    const tweetsWithImages = data.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })

    res.render('tweets', {
      tweets: tweetsWithImages,
      user: currentUserData,
    })
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
      res.status(200).json({ message: 'Tweet liked successfully' })
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
      res.status(200).json({ message: 'Tweet unliked successfully' })
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
      IFNULL(reply_counts.count, 0) AS reply_count, IF(tl.user_id IS NULL, 0, 1) AS is_liked,
      GROUP_CONCAT(tweet_images.image_path) AS images
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
      LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
      WHERE tweets.id = ?
      GROUP BY tweets.id, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id`,
      [currentUserID, tweetId]
    )
    data.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })

    if (data.length === 0) {
      throw new Error('找不到該推文')
    }
    const tweet = data[0]
    // console.log(tweet)

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
    res.render('tweet', { tweet, replies })
  },
  postTweet: async (req, res, next) => {
    try {
      const { description } = req.body
      const currentUserID = res.locals.userId
      const files = req.files
      // console.log(req.files)
      const images = await Promise.all(files['tweetImages'] || [])
      if (description.length > 140) {
        throw new Error('請以 140 字以內為限')
      } else if (description.trim() === '') {
        throw new Error('內容不可空白')
      }
      const connection = await pool.getConnection()
      await connection.beginTransaction()
      try {
        const [rows] = await pool.execute(
          `INSERT INTO tweets (user_id, content) VALUES (?, ?)`,
          [currentUserID, description]
        )
        const tweetId = rows.insertId
        if (images.length > 0) {
          const insertPromises = images.map(image =>
            connection.execute(
              'INSERT INTO tweet_images (tweet_id, fileName, image_path, size) VALUES (?, ?, ?, ?)',
              [tweetId, image.filename, image.path, image.size]
            )
          )
          await Promise.all(insertPromises)
        }
        await connection.commit()
        res.redirect('back')
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
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
      // res.redirect('back')
      res.status(200).json({ message: '推文已隱藏' })
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
  getSearchUser: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    res.render('searchUser', {
      user: currentUserData,
    })
  },
  getSearchUserAPI: async (req, res, next) => {
    const currentUserID = res.locals.userId

    const q = req.query.q?.trim().toLowerCase()
    const [userSearchResults, fields] = await pool.execute(
      `SELECT users.*, IFNULL(followships.is_following, 0) AS is_following,
      CASE WHEN users.id = ? THEN 1 ELSE 0 END AS is_current_user
      FROM users
      LEFT JOIN (
        SELECT follower_id, following_id, 1 AS is_following
        FROM followships
        WHERE follower_id = ? AND followships.is_active=1
      ) AS followships ON followships.following_id = users.id
      WHERE name LIKE ?`,
      [currentUserID, currentUserID, `%${q}%`]
    )
    // console.log(userSearchResults)
    res.json({ userSearchResults, q })
  },
  getSearchTweet: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    res.render('search', {
      user: currentUserData,
    })
  },
  getSearchTweetAPI: async (req, res, next) => {
    const currentUserID = res.locals.userId

    const q = req.query.q?.trim().toLowerCase()
    // 取推文
    let query = `
      SELECT tweets.*, users.name, users.avatar, 
      IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
      IF(tl.user_id IS NULL, 0, 1) AS is_liked,
      GROUP_CONCAT(tweet_images.image_path) AS images
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
      LEFT JOIN tweet_images ON tweets.id = tweet_images.tweet_id
      WHERE tweets.is_active = 1
        AND tweets.id NOT IN (
          SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
      )
      `
    const params = [currentUserID, currentUserID]
    if (q) {
      query += ' AND tweets.content LIKE ?'
      params.push(`%${q}%`)
    } else {
      query += ' AND tweets.id =999999999'
    } //若無q則無搜尋結果
    query += `
      GROUP BY tweets.id, tweets.user_id, tweets.content, tweets.is_active, tweets.created_at, tweets.updated_at, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id
      ORDER BY like_count DESC
    `
    // console.log(query)
    const [data, fields] = await pool.execute(query, params)

    const tweetsWithImages = data.map(tweet => {
      if (tweet.images) {
        tweet.images = tweet.images.split(',').map(image => {
          if (image.startsWith('https://')) {
            return image
          } else {
            return `\\${image}`
          }
        })
      } else {
        tweet.images = []
      }
      return tweet
    })
    // console.log(tweetsWithImages)
    res.json({ tweets: tweetsWithImages, q })
  },
  getRecommendUsersAPI: async (req, res, next) => {
    const currentUserID = res.locals.userId
    // 取推薦人
    const matrix = await transformData()
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
        if (b[1] === a[1]) {
          // 若評分相同則按照 ID 大小排序
          return parseInt(b[0]) - parseInt(a[0])
        }
        return b[1] - a[1]
      }
      // NaN放後面
      if (isNaN(b[1]) || isNaN(a[1])) {
        return isNaN(b[1]) ? -1 : 1
      }
    })
    const sortedUserIds = sortedResults.map(([userId]) => parseInt(userId))
    const userIdsStr = sortedUserIds.join(',')
    // console.log(userIdsStr)

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
    res.status(200).json(follows)
  },
}
export default tweetController
