import pool from '../middleware/databasePool.js'

const chatController = {
  getApi: async (req, res, next) => {
    res.render('chat')
  },
  getRoomList: async (req, res, next) => {
    const currentUserId = 17
    const [chatUserLists] = await pool.execute(
      `
      SELECT 
        CASE
          WHEN r.user1_id =? THEN r.user2_id
          ELSE r.user1_id
        END AS receiver_id,
        u.name AS receiver_name,
        u.avatar AS receiver_avatar,
        r.name AS roomName,
        m.room_id,
        m.message
      FROM
        messages AS m
      INNER JOIN(
        SELECT room_id, MAX(created_at) AS max_created_at
        FROM messages
        GROUP BY room_id
      ) AS sub ON m.room_id = sub.room_id AND m.created_at = sub.max_created_at
      INNER JOIN rooms AS r ON m.room_id = r.id
      INNER JOIN users AS u ON (
        CASE 
          WHEN r.user1_id = ? THEN r.user2_id
          ELSE r.user1_id
        END) = u.id
      WHERE
        r.user1_id = ? OR r.user2_id = ?
      ORDER BY m.created_at DESC
      `,
      [currentUserId, currentUserId, currentUserId, currentUserId]
    )
    //   console.log(chatUserLists)
    //   [{
    //   receiver_id: 2,
    //   receiver_name: 'SHAQ',
    //   receiver_avatar: 'https://pbs.twimg.com/profile_images/1579949436527988737/RDqn1udJ_400x400.jpg',
    //   roomName: '2-17',
    //   room_id: 2,
    //   message: 'hi im17 too'
    // },...]

    res.json(chatUserLists)
  },
  getRoomMessages: async (req, res, next) => {
    const roomId = req.params.roomId
    const [roomMessage] = await pool.execute(
      `
    SELECT * FROM messages WHERE room_id =? ORDER BY created_at DESC
    `,
      [roomId]
    )
    //   console.log(roomMessage)
    //   [{
    //   id: 3,
    //   user_id: 17,
    //   room_id: 2,
    //   message: 'hi im17',
    //   created_at: 2023-06-29T07:04:43.000Z
    // },...]

    res.json(roomMessage)
  },
}

export default chatController
