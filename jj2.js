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
  const [data] = await pool.query(
    `SELECT id,tweet_id,user_id,rating FROM ratings`
  )
  console.log(data)
}
aa()

// [
//   { id: 1, tweet_id: 1, user_id: 16, rating: 5 },
//   { id: 2, tweet_id: 2, user_id: 16, rating: 5 },
//   { id: 3, tweet_id: 3, user_id: 16, rating: 5 },
// ]
