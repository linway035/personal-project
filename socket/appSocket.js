import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import * as chatHelpers from '../helpers/chat-helpers.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
  allowEIO3: true,
})

app.use(cors())

io.on('connection', socket => {
  const userId = socket.id
  console.log(`a user connected ${userId}`)

  socket.on('disconnect', () => {
    console.log(`user ${userId} disconnected`)
  })

  socket.on('message', ({ sender, message }) => {
    // 假設使用者之間的私訊儲存在 chatHelpers 中的 chatRecords 物件中
    chatHelpers.addChatRecord(sender, activeChatUser, message)

    // 廣播訊息給目標使用者
    const targetSocket = Object.values(io.sockets.sockets).find(
      socket => socket.id === chatHelpers.getUserIdByName(activeChatUser)
    )
    if (targetSocket) {
      targetSocket.emit('message', {
        sender: sender,
        message: message,
      })
    }
  })

  socket.on('join', roomName => {
    socket.join(roomName)
    console.log(`User ${userId} joined room: ${roomName}`)
  })

  socket.on('send', async data => {
    console.log(data)
    const { userName, message, senderId, receiverId, roomName } = data
    await chatHelpers.checkRoom(senderId, receiverId, roomName)
    socket
      .to(receiverId.toString())
      .emit('message', { userName, message, senderId, receiverId, roomName })
    const roomId = await chatHelpers.getRoomIdByName(roomName)
    await chatHelpers.saveMessage(senderId, roomId, message)
  })
})

server.listen(8080, () => {
  console.log('Socket server is listening on port:8080')
})
