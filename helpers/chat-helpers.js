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

export async function getRoomIdByName(roomName) {
  const [rows] = await pool.execute(
    `
    SELECT id FROM rooms
    WHERE name = ?
    `,
    [roomName]
  )

  if (rows.length > 0) {
    return rows[0].id
  }

  return null
}

export async function getMessagesByRoom(roomName) {
  const roomId = getRoomIdByName(roomName)
  const [rows] = await pool.execute(
    `
    SELECT user_id, room_id, message FROM messages
    WHERE room_id = ?
    ORDER BY created_at
    `,
    [roomId]
  )
  const data = rows
  return data
}

//pending
export async function getChatListById(id) {
  /*
     [
   {
    senderId: 1,
     room_name: '117',
     last_message: '111',
     updated_at: 2023-06-27T05:24:35.000Z,
     attendants: '1,17',
     sender_id: 0,
     receiverId: 17,
     receiverName: 'kelly12',
     receiverPicture: '/img/users/5.png'
   },
     */

  const [rows] = await pool.query(
    `
      SELECT subQuery.*, urs.user_id as receiverId 
      FROM (
              SELECT urs.user_id as senderId , rs.*
              FROM users_rooms AS urs 
              INNER JOIN rooms AS rs 
              ON urs.room_name = rs.room_name
              WHERE user_id = (?)
          ) AS subQuery
      INNER JOIN users_rooms AS urs ON subQuery.room_name = urs.room_name AND subQuery.senderId <> urs.user_id
      ORDER BY subQuery.updated_at DESC
    `,
    [id]
  )

  const receiverIds = rows.map(item => item.receiverId)

  const receiverProfileData = await userModels.getUserProfileData(receiverIds)

  // console.log('receiverProfileData->',receiverProfileData);

  const newData = rows.forEach(item => {
    const receiverData = receiverProfileData.filter(
      profileItem => profileItem.id === item.receiverId
    )
    item['receiverName'] = receiverData[0].name
    item['receiverPicture'] = receiverData[0].picture
    return item
  })

  return rows
}
