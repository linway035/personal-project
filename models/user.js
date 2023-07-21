import pool from './databasePool.js'

export async function getCurrentUserData (currentUserID) {
  const [currentUser] = await pool.execute(
    `
    SELECT id, name, avatar FROM users WHERE id =?`,
    [currentUserID]
  )
  const currentUserData = currentUser[0]
  return currentUserData
}

export async function getPageUserData (userId) {
  const [pageUser] = await pool.execute(
    'SELECT id, name from users WHERE id =?',
    [userId]
  )
  return pageUser
}

export async function getProfilePageData (currentUserID, userId) {
  const [user] = await pool.execute(
    `
        SELECT u.*, IF(f.following_id IS NULL, 0, 1) AS is_following,
        (SELECT COUNT(*) FROM followships WHERE following_id = u.id AND is_active = 1) AS followers_count,
        (SELECT COUNT(*) FROM followships WHERE follower_id = u.id AND is_active = 1) AS following_count
        FROM users AS u
        LEFT JOIN (
          SELECT following_id
          FROM followships
          WHERE follower_id = ? AND is_active = 1
        ) AS f ON u.id = f.following_id
        WHERE u.id =?`,
    [currentUserID, userId]
  )
  return user
}

export async function getUserFollowingsData (currentUserID, userId) {
  const [users] = await pool.execute(
    `
      SELECT u.id, u.name, u.avatar, u.bio, IF(f.following_id IS NULL, 0, 1) AS is_following
      FROM users u
      LEFT JOIN followships f ON f.following_id = u.id AND f.follower_id = ? AND f.is_active = 1
      WHERE u.id IN 
      (SELECT following_id FROM followships WHERE follower_id=? AND is_active=1)
      ORDER BY u.name ASC`,
    [currentUserID, userId]
  )
  return users
}

export async function getUserFollowersData (currentUserID, userId) {
  const [users] = await pool.execute(
    `
      SELECT u.id, u.name, u.avatar, u.bio, IF(f.following_id IS NULL, 0, 1) AS is_following
      FROM users u
      LEFT JOIN followships f ON f.following_id = u.id AND f.follower_id = ? AND f.is_active = 1
      WHERE u.id IN 
      (SELECT follower_id FROM followships WHERE following_id=? AND is_active=1)
      ORDER BY u.name ASC`,
    [currentUserID, userId]
  )
  return users
}

export async function getUserRepliesData (userId) {
  const [replies] = await pool.execute(
    `
        SELECT r.*, t.user_id as tweet_user_id, u.name as tweet_user_name FROM replies r
        LEFT JOIN tweets t on r.tweet_id=t.id
        LEFT JOIN users u on t.user_id=u.id
        where r.user_id =? AND r.is_active=1 AND t.is_active=1
        ORDER BY r.updated_at DESC;
      `,
    [userId]
  )
  return replies
}

export async function getUserLikeTweets (currentUserID, userId) {
  const [tweets] = await pool.execute(
    `
        SELECT tweets.*, users.name, users.avatar, 
        IFNULL(like_counts.count, 0) AS like_count, IFNULL(reply_counts.count, 0) AS reply_count,
        IF(MAX(tl.user_id) IS NULL, 0, 1) AS is_liked,
        GROUP_CONCAT(tweet_images.image_path) AS images,
        tll.updated_at as like_date
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
        LEFT JOIN (
          SELECT * FROM tweet_likes where user_id =? and is_active=1
        ) AS tll ON tweets.id = tll.tweet_id
        WHERE tweets.is_active = 1 AND tweets.id IN(
          SELECT tweet_id FROM tweet_likes where user_id =? and is_active=1
        ) AND tweets.id NOT IN (
          SELECT tweet_id FROM hidden_tweets WHERE user_id = ?
        )
        GROUP BY tweets.id, tll.updated_at
        ORDER BY like_date DESC
      `,
    [currentUserID, userId, userId, currentUserID]
  )
  return tweets
}
