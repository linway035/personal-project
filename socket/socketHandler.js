import * as chatHelpers from '../helpers/chat-helpers.js'

export function socketHandler(io) {
  io.on('connection', socket => {
    console.log(`a user connected `)

    socket.on('disconnect', () => {
      console.log(`a user disconnected`)
    })

    socket.on('join', ({ roomId, userName }) => {
      socket.join(roomId)
      console.log(`user ${userName} join roomId ${roomId}`)
    })

    socket.on('message', async ({ sender, room, message }) => {
      console.log(`Received message from ${sender} to ${room}: ${message}`)
      await chatHelpers.saveMessage(sender, room, message)
      socket.to(room.toString()).emit('message', { sender, room, message })
    })
  })
}
