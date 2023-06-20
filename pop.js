import mysql from 'mysql2/promise'
import * as dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

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

const matrix = await transformData()
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

const userId = 1

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

console.log(similarityResults)

const sortedResults = Object.entries(similarityResults).sort((a, b) => {
  // 非 NaN 的相似度值降序排列
  if (!isNaN(b[1]) && !isNaN(a[1])) {
    return b[1] - a[1]
  }
  // 如果其中一个相似度值为 NaN，则将 NaN 排在后面
  if (isNaN(b[1]) || isNaN(a[1])) {
    return isNaN(b[1]) ? -1 : 1
  }
  // 如果相似度值相等，根据 ID 从大到小排列
  return parseInt(b[0]) - parseInt(a[0])
})

console.log(sortedResults)

const sortedUserIds = sortedResults.map(([userId]) => parseInt(userId))
console.log(sortedUserIds)
