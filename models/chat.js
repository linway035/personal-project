import pool from './databasePool.js'

export async function saveMessage (senderId, roomId, message) {
  await pool.execute(
    `
      INSERT INTO messages ( user_id , room_id , message )
      VALUES (? ,? ,?)
    `,
    [senderId, roomId, message]
  )
}

export async function checkRoom (senderId, receiverId) {
  // id較小者當user1
  const [smallerID, biggerID] = [
    Math.min(senderId, receiverId),
    Math.max(senderId, receiverId)
  ]
  const roomName = `${smallerID}-${biggerID}`
  const [result] = await pool.execute(
    `
      SELECT COUNT(*) as count FROM rooms WHERE name=?
    `,
    [roomName]
  )
  const isRoomExist = result[0].count > 0

  if (!isRoomExist) {
    try {
      const createRoomQuery =
        'INSERT INTO rooms (name, user1_id, user2_id) VALUES (?,?,?)'
      await pool.execute(createRoomQuery, [roomName, smallerID, biggerID])
    } catch (error) {
      console.error('Error occurred while inserting data:', error)
    }
  }
}

export async function getChatUserLists (currentUserID) {
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
    [currentUserID, currentUserID, currentUserID, currentUserID]
  )
  return chatUserLists
}

export async function getRoomMessages (roomId) {
  const [roomMessage] = await pool.execute(
    `
    SELECT * FROM messages WHERE room_id =? ORDER BY created_at ASC
    `,
    [roomId]
  )
  return roomMessage
}

export async function getNowReceiverData (receiverID) {
  const [nowReceiver] = await pool.execute(
    `
    SELECT id, name, avatar FROM users WHERE id =?`,
    [receiverID]
  )
  return nowReceiver[0]
}

export async function getRoomIdByRoomName (roomName) {
  const [roomId] = await pool.execute(
    `
      SELECT id FROM rooms WHERE name=?
    `,
    [roomName]
  )
  return roomId[0].id
}
