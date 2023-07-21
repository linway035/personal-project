import pool from './databasePool.js'

// Tweets from myself and the people I'm following
export async function getFollowingTweets (currentUserID) {
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
  return data
}

// Replies from myself and the people I'm following
export async function getFollowingReplies (currentUserID) {
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
  return replies
}

export async function postLike (currentUserID, tweetId) {
  // 若違反唯一性約束條件，則觸發重複鍵更新的邏輯
  await pool.execute(
    `INSERT INTO tweet_likes (user_id, tweet_id, is_active, updated_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()`,
    [currentUserID, tweetId]
  )
}

export async function postUnlike (currentUserID, tweetId) {
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
}

export async function getSpecifiedTweet (currentUserID, tweetId) {
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
  return data
}

export async function getRepliesOfTweet (tweetId) {
  const [replies] = await pool.execute(
    `
    SELECT replies.*, users.name, users.avatar 
    FROM replies
    JOIN users ON replies.user_id = users.id
    WHERE tweet_id = ? AND is_active = 1;
    `,
    [tweetId]
  )
  return replies
}

export async function postHidden (currentUserID, tweetId) {
  await pool.execute(
    `INSERT INTO hidden_tweets (user_id, tweet_id)
        VALUES (?, ?)
        `,
    [currentUserID, tweetId]
  )
}

export async function postRating (currentUserID, tweetId, rating) {
  await pool.execute(
    `INSERT INTO ratings (user_id, tweet_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ? , updated_at = NOW();
        `,
    [currentUserID, tweetId, rating, rating]
  )
}

export async function getRating (tweetId, currentUserID) {
  const [rows, fields] = await pool.execute(
    `SELECT rating FROM ratings WHERE tweet_id=? AND user_id=?
        `,
    [tweetId, currentUserID]
  )
  const rating = rows[0]?.rating || null // 給前端判斷null情況
  return rating
}

export async function deleteRating (tweetId, currentUserID) {
  await pool.execute('DELETE FROM ratings WHERE tweet_id=? and user_id=?;', [
    tweetId,
    currentUserID
  ])
}

export async function getTweetsByElasticSearch (tweetIds) {
  // query 和 execute結果會不同
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
  return data
}

export async function getUsersByElasticSearch (currentUserID, userIds) {
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
  return results
}

export async function getTweetsOfOneUser (currentUserID, userId) {
  const [tweets] = await pool.execute(
    `
        SELECT tweets.*, users.name, users.avatar, 
        IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
        IF(MAX(tl.user_id) IS NULL, 0, 1) AS is_liked,
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
        WHERE tweets.is_active = 1 AND tweets.user_id = ? AND tweets.id NOT IN (
          SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
        )
        GROUP BY tweets.id
        ORDER BY tweets.updated_at DESC
      `,
    [currentUserID, userId, currentUserID]
  )
  return tweets
}
