import * as chatHelpers from '../helpers/chat-helpers.js'

export function socketHandler(io) {
  io.on('connection', socket => {
    const userId = socket.id
    console.log(`a user connected ${userId}`)

    socket.on('disconnect', () => {
      console.log(`user ${userId} disconnected`)
    })

    socket.on('join', roomId => {
      socket.join(roomId)
      console.log(`user ${userId} join ${roomId}`)
    })

    socket.on('message', async ({ sender, room, message }) => {
      console.log(`Received message from ${sender} to ${room}: ${message}`)
      await chatHelpers.saveMessage(sender, room, message)
      socket.to(room.toString()).emit('message', { sender, room, message })
    })
  })
}

// socket.on('send', async data => {
//   console.log(data)
//   const { userName, message, senderId, receiverId, roomName } = data
//   await chatHelpers.checkRoom(senderId, receiverId, roomName)
//   socket
//     .to(receiverId.toString())
//     .emit('message', { userName, message, senderId, receiverId, roomName })
//   const roomId = await chatHelpers.getRoomIdByName(roomName)
//   await chatHelpers.saveMessage(senderId, roomId, message)
// })
