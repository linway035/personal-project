import pool from '../middleware/databasePool.js'
const followshipController = {
  postFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.body.id)
      if (currentUserID === followingId)
        throw new Error('Cannot follow yourself!')
      await pool.execute(
        `INSERT INTO followships (follower_id, following_id, is_active, updated_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()`,
        [currentUserID, followingId]
      )
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  unFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.params.id)
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
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
}
export default followshipController
