import pool from '../middleware/databasePool.js'
import * as userModel from '../models/user.js'
import * as tweetModel from '../models/tweet.js'
import * as es from '../es/es.js'
import tweetHelpers from '../helpers/tweet-helpers.js'
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
  if (commonIndices.length === 0) {
    return 0
  }

  const numerator = commonIndices.reduce(
    (sum, index) => sum + ratings[user1][index] * ratings[user2][index],
    0
  )
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
    const currentUserData = await userModel.getCurrentUserData(currentUserID)

    const data = await tweetModel.getFollowingTweets(currentUserID)
    const tweetsWithImages = await tweetHelpers.joinTweetsWithImages(data)

    const replies = await tweetModel.getFollowingReplies(currentUserID)

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
    const currentUserData = await userModel.getCurrentUserData(currentUserID)

    // calculate cosine similarity of each user
    const matrix = await transformData() // 若放在最外層則不會更新
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

    // Recommend tweets based on predictedRatings
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
    })) // array of objects [{ index: 61, score: 0 },...]
    indexedScores.sort((a, b) => b.score - a.score)
    const sortedIndices = indexedScores.map(item => item.index + 1)
    const tweetIDsSorted = sortedIndices.join(',')

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

    const tweetsWithImages = await tweetHelpers.joinTweetsWithImages(data)

    res.render('tweets', {
      tweets: tweetsWithImages,
      user: currentUserData,
    })
  },
  postLike: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      await tweetModel.postLike(currentUserID, tweetId)
      res.status(200).json({ message: 'Tweet liked successfully' })
    } catch (error) {
      next(error)
    }
  },
  postUnlike: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      await tweetModel.postUnlike(currentUserID, tweetId)
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
      if (!content) {
        console.log('no content')
        req.flash('error_messages', '內容不可空白')
        return res.redirect('back')
      }
      await pool.execute(
        `
      INSERT INTO replies (tweet_id, user_id, content, parent_id, path)
      VALUES (?,?,?,?,?)`,
        [tweetId, currentUserID, content, null, tweetId]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  getTweetPage: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const currentUserData = await userModel.getCurrentUserData(currentUserID)
      const tweetId = req.params.id
      const data = await tweetModel.getSpecifiedTweet(currentUserID, tweetId)
      if (data.length === 0) {
        throw new Error('找不到該推文')
      }
      await tweetHelpers.joinTweetsWithImages(data)
      const tweet = data[0]
      tweet.currentUser = currentUserData
      const replies = await tweetModel.getRepliesOfTweet(tweetId)
      res.render('tweet', { tweet, replies, user: currentUserData })
    } catch (error) {
      next(error)
    }
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
      await tweetModel.postHidden(currentUserID, tweetId)
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
      await tweetModel.postRating(currentUserID, tweetId, rating)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },
  getRating: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      const rating = await tweetModel.getRating(tweetId, currentUserID)
      res.status(200).json({ rating })
    } catch (error) {
      next(error)
    }
  },
  deleteRating: async (req, res, next) => {
    const tweetId = req.params.id
    const currentUserID = res.locals.userId
    try {
      await tweetModel.deleteRating(tweetId, currentUserID)
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  },
  getSearchUser: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const currentUserData = await userModel.getCurrentUserData(currentUserID)
    res.render('searchUser', {
      user: currentUserData,
    })
  },
  getSearchTweet: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const currentUserData = await userModel.getCurrentUserData(currentUserID)
    res.render('search', {
      user: currentUserData,
    })
  },
  getRecommendUsersAPI: async (req, res, next) => {
    const currentUserID = res.locals.userId

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

    const data = await tweetModel.getTweetsByElasticSearch(tweetIds)
    const tweetsWithImages = await tweetHelpers.joinTweetsWithImages(data)
    res.json({ tweets: tweetsWithImages, q: query })
  },
  getUsersByElasticSearch: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const query = req.query.q.trim()

    let userSearchResults = []
    if (query.length > 0) {
      const userIds = await es.searchUserByElastic(query)
      if (userIds.length > 0) {
        const results = await tweetModel.getUsersByElasticSearch(
          currentUserID,
          userIds
        )
        userSearchResults = results
      }
    }
    res.json({ userSearchResults, q: query })
  },
}
export default tweetController
