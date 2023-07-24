import pool from './databasePool.js'

export async function postFollow (currentUserID, followingId) {
  await pool.execute(
    `INSERT INTO followships (follower_id, following_id, is_active, updated_at)
      VALUES (?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()`,
    [currentUserID, followingId]
  )
}

export async function postUnfollow (currentUserID, followingId) {
  await pool.execute(
    `UPDATE followships
      SET is_active = 0, updated_at = NOW()
      WHERE id IN (
        SELECT id
        FROM (
          SELECT tl.id
          FROM followships AS tl
          WHERE tl.follower_id = ? AND tl.following_id = ?
          LIMIT 1
        ) AS subquery
      )`,
    [currentUserID, followingId]
  )
}
