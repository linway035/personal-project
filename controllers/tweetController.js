import pool from '../middleware/databasePool.js'
import * as es from '../es/es.js'
import fs from 'fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
})

async function uploadFileToS3(file) {
  // console.log(file)
  //   {
  //   fieldname: 'tweetImages',
  //   originalname: 'Snipa.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: 'uploads/',
  //   filename: '73c327099be6ffe1da5c1adc0b9f4234',
  //   path: 'uploads\\73c327099be6ffe1da5c1adc0b9f4234',
  //   size: 2455
  // }
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
  }

  const command = new PutObjectCommand(uploadParams)

  try {
    await s3.send(command)
    fs.unlink(file.path, error => {
      if (error) {
        console.error(`無法刪除檔案：${file.path}`, error)
      }
    })
  } catch (error) {
    throw new Error(`Failed to upload file to S3: ${error.message}`)
  }
}

async function transformData() {
  const [data] = await pool.query(
    'SELECT tweet_id, user_id, rating FROM ratings'
  )
  const [usersCount] = await pool.query(
    'SELECT MAX(id) AS usersCount FROM users'
  )
  const [tweetsCount] = await pool.query(
    'SELECT MAX(id) AS tweetsCount FROM tweets'
  )
  const usersLength = usersCount[0].usersCount
  const tweetsLength = tweetsCount[0].tweetsCount

  const transformedData = {}

  // Initialize the transformed data object with empty arrays for each user
  for (let user_id = 1; user_id <= usersLength; user_id++) {
    transformedData[user_id] = Array(tweetsLength).fill(null) // 調參
  }

  // Populate the transformed data with ratings
  data.forEach(({ tweet_id, user_id, rating }) => {
    transformedData[user_id][tweet_id - 1] = rating
  })

  return transformedData
}

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

const predictRatings = (user, otherUsers, ratings) => {
  const k =
    1 /
    otherUsers.reduce(
      (sum, otherUser) => sum + calculateSimilarity(user, otherUser, ratings),
      0
    )

  const predictedRatings = []
  for (let i = 0; i < ratings[user].length; i++) {
    // 若填補值為null則null，0則
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

    // 取推文 自己和追蹤的
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
      SELECT following_id FROM followships WHERE follower_id = ? AND followships.is_active=1
    ) OR tweets.user_id = ?)
    GROUP BY tweets.id, tweets.user_id, tweets.content, tweets.is_active, tweets.created_at, tweets.updated_at, users.name, users.avatar, like_counts.count, reply_counts.count, tl.user_id
    ORDER BY tweets.updated_at DESC
    `,
      [currentUserID, currentUserID, currentUserID, currentUserID]
    )

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

    // 取回覆 自己 和 我追的人 的回覆
    const [replies, others] = await pool.execute(
      `
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
    FROM replies as r
    LEFT JOIN tweets AS t ON r.tweet_id = t.id
    LEFT JOIN users AS u ON r.user_id = u.id
    LEFT JOIN users AS tu ON t.user_id = tu.id
    WHERE
    (r.user_id IN (SELECT following_id FROM followships WHERE follower_id = ? AND is_active = 1) OR r.user_id = ?) AND
    t.is_active=1 AND
    r.is_active=1
    ORDER BY r.created_at DESC;
    `,
      [currentUserID, currentUserID]
    )

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
  getForYouPage: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]

    // 取推薦人
    const matrix = await transformData() // 若放在最外層則不會更新
    // console.log(matrix)
    const userId = res.locals.userId

    const similarityResults = {}
    for (const user in matrix) {
      if (user !== userId.toString()) {
        similarityResults[user] = calculateSimilarity(
          userId.toString(),
          user,
          matrix
        )
      }
    }
    // console.log(similarityResults) 得知相似度

    // 推薦文
    const otherUsers = Object.keys(matrix).filter(
      user => parseInt(user) !== userId
    )
    // console.log(otherUsers) 將所有其他使用者id變成一個array
    const predictedRatings = predictRatings(
      userId.toString(),
      otherUsers,
      matrix
    )
    // console.log('predict', predictedRatings) 全部推文評分，array
    const indexedScores = predictedRatings.map((score, index) => ({
      index,
      score,
    })) // array of object [{ index: 61, score: 0 },...]
    indexedScores.sort((a, b) => b.score - a.score) // sort會更改原array
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
    )

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
      // 若違反唯一性約束條件，則觸發重複鍵更新的邏輯
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
      // MySQL不允許在 UPDATE查詢中直接使用來自相同表格的子查詢，故改間接
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
      const tweetId = Number(req.params.id)
      const currentUserID = res.locals.userId
      const content = req.body.comment
      // console.log(content)
      if (!content) {
        console.log('no content')
        req.flash('error_messages', '內容不可空白')
        return res.redirect('back')
        // res.status(500).json({ message: '回覆失敗' })
      }
      await pool.execute(
        `
      INSERT INTO replies (tweet_id, user_id, content, parent_id, path)
      VALUES (?,?,?,?,?)`,
        [tweetId, currentUserID, content, null, tweetId]
      )
      res.redirect('back')
      // res.status(200).json({ message: '回覆成功' })
    } catch (error) {
      next(error)
    }
  },
  getTweetPage: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const [currentUser] = await pool.execute(
      `
    SELECT id, name, avatar FROM users WHERE id =?`,
      [currentUserID]
    )
    const currentUserData = currentUser[0]
    // console.log(currentUserData)

    const tweetId = req.params.id
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
    tweet.currentUser = currentUserData
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
    res.render('tweet', { tweet, replies, user: currentUserData })
  },
  postTweet: async (req, res, next) => {
    try {
      const AWS_CDN = process.env.AWS_CDN
      const { description } = req.body
      const currentUserID = res.locals.userId
      const files = req.files
      const images = await Promise.all(files.tweetImages || [])
      const uploadPromises = images.map(image => uploadFileToS3(image))
      await Promise.all(uploadPromises)
      if (description.length > 140) {
        throw new Error('請以 140 字以內為限')
      } else if (description.trim() === '') {
        throw new Error('內容不可空白')
      }
      const connection = await pool.getConnection()
      await connection.beginTransaction()
      try {
        const [rows] = await pool.execute(
          'INSERT INTO tweets (user_id, content) VALUES (?, ?)',
          [currentUserID, description]
        )
        const tweetId = rows.insertId
        if (images.length > 0) {
          const insertPromises = images.map(image =>
            connection.execute(
              'INSERT INTO tweet_images (tweet_id, fileName, image_path, size) VALUES (?, ?, ?, ?)',
              [
                tweetId,
                image.filename,
                `${AWS_CDN}/${image.filename}`,
                image.size,
              ]
            )
          )
          await Promise.all(insertPromises)
        }
        await connection.commit()
        res.json({ message: '貼文成功' })
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
      const rating = rows[0]?.rating || null // 給前端判斷null情況
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
  getRecommendUsersAPI: async (req, res, next) => {
    const currentUserID = res.locals.userId
    // 取推薦人
    const matrix = await transformData()
    const userId = res.locals.userId
    const similarityResults = {}
    for (const user in matrix) {
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
      // 默認返回值
      return 0
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
  getTweetsByElasticSearch: async (req, res, next) => {
    const query = req.query.q
    if (!query || query.trim() === '') {
      return res.json({ tweets: [], q: query })
    }
    const searchkeywords = query.split(' ')
    const tweetIds = await es.searchByElastic(searchkeywords)
    if (tweetIds.length === 0) {
      return res.json({ tweets: [], q: query })
    }

    // query 和 execute結果不同
    const [data, fields] = await pool.query(
      `
    SELECT
      tweets.*,
      users.name,
      users.avatar,
      GROUP_CONCAT(tweet_images.image_path) AS images
    FROM
      tweets
    LEFT JOIN
      tweet_images ON tweets.id = tweet_images.tweet_id
    JOIN
      users ON tweets.user_id = users.id
    WHERE
      tweets.id IN (?) AND tweets.is_active = 1
    GROUP BY
      tweets.id, tweets.content, users.name, users.avatar
    ORDER BY
      FIELD(tweets.id, ?);
    `,
      [tweetIds, tweetIds]
    )
    // console.log('data', data)

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
    res.json({ tweets: tweetsWithImages, q: query })
  },
  getUsersByElasticSearch: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const query = req.query.q.trim()

    let userSearchResults = []
    if (query.length > 0) {
      const userIds = await es.searchUserByElastic(query)
      if (userIds.length > 0) {
        const [results, fields] = await pool.query(
          `SELECT users.*, IFNULL(followships.is_following, 0) AS is_following,
      CASE WHEN users.id = ? THEN 1 ELSE 0 END AS is_current_user
      FROM users
      LEFT JOIN (
        SELECT follower_id, following_id, 1 AS is_following
        FROM followships
        WHERE follower_id = ? AND followships.is_active=1
      ) AS followships ON followships.following_id = users.id
      WHERE id in (?)
      ORDER BY field(users.id,?);
      `,
          [currentUserID, currentUserID, userIds, userIds]
        )
        userSearchResults = results
      }
    }
    res.json({ userSearchResults, q: query })
  },
}
export default tweetController
