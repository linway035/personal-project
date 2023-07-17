import * as chatHelpers from '../helpers/chat-helpers.js'

export function socketHandler (io) {
  io.on('connection', socket => {
    console.log('a user connected ')

    socket.on('disconnect', () => {
      console.log('a user disconnected')
    })

    socket.on('join', ({ senderId, userName }) => {
      socket.join(senderId)
      console.log(`user ${userName} join space ${senderId}`)
    })

    socket.on('check', async ({ senderId, receiverId }) => {
      await chatHelpers.checkRoom(senderId, receiverId)
      console.log('checkroom')
    })

    socket.on('message', async ({ sender, roomID, message, receiverID }) => {
      console.log(
        `Received message from ${sender} to ${receiverID} room ${roomID}: ${message}`
      )
      await chatHelpers.saveMessage(sender, roomID, message)
      // socket
      //   .to([room.toString(), sender])
      //   .emit('message', { sender, room, message })
      io.to(receiverID).to(sender).emit('message', {
        sender,
        roomID,
        message
      })
    })
  })
}
