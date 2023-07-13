import mysql from 'mysql2/promise'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

async function aa() {
  const [data] = await pool.query(`SELECT tweet_id,user_id,rating FROM ratings`)
  console.log(data)
}
// aa()

// [
//   { tweet_id: 16, user_id: 16, rating: 5 },
//   { tweet_id: 19, user_id: 16, rating: 5 },
//   { tweet_id: 23, user_id: 17, rating: 5 },
//   { tweet_id: 24, user_id: 17, rating: 5 }
// ]

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
  // console.log(
  //   'data',
  //   data,
  //   'usersCount',
  //   usersCount[0].usersCount,
  //   'tweetsCount',
  //   tweetsCount[0].tweetsCount
  // )
  const data2 = [
    { tweet_id: 1, user_id: 4, rating: 5 },
    { tweet_id: 2, user_id: 4, rating: 5 },
    { tweet_id: 3, user_id: 3, rating: 5 },
    { tweet_id: 4, user_id: 3, rating: 5 },
    { tweet_id: 5, user_id: 4, rating: 4 },
    { tweet_id: 7, user_id: 4, rating: 4 },
    { tweet_id: 5, user_id: 1, rating: 4 },
    { tweet_id: 1, user_id: 1, rating: 5 },
  ]

  const transformedData = {}

  // Initialize the transformed data object with empty arrays for each user
  for (let user_id = 1; user_id <= usersLength; user_id++) {
    transformedData[user_id] = Array(tweetsLength).fill(null)
  }

  // Populate the transformed data with ratings
  data.forEach(({ tweet_id, user_id, rating }) => {
    transformedData[user_id][tweet_id - 1] = rating
  })

  console.log(transformedData)
}

transformData()
