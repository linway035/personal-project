import pool from '../middleware/databasePool.js'

export async function saveMessage(senderId, roomId, message) {
  await pool.execute(
    `
      INSERT INTO messages ( user_id , room_id , message )
      VALUES (? ,? ,?)
    `,
    [senderId, roomId, message]
  )
}

export async function checkRoom(senderId, receiverId) {
  // id較小者當user1
  const [smallerID, biggerID] = [
    Math.min(senderId, receiverId),
    Math.max(senderId, receiverId),
  ]
  const roomName = `${smallerID}-${biggerID}`
  const [result] = await pool.execute(
    `
      SELECT COUNT(*) as count FROM rooms WHERE name=?
    `,
    [roomName]
  )
  const isRoomExist = result[0].count > 0
  console.log('isRoomExist', isRoomExist)

  if (!isRoomExist) {
    try {
      // create room
      const createRoomQuery =
        'INSERT INTO rooms (name, user1_id, user2_id) VALUES (?,?,?)'
      await pool.execute(createRoomQuery, [roomName, smallerID, biggerID])
    } catch (error) {
      console.error('Error occurred while inserting data:', error)
    }
  }
}
