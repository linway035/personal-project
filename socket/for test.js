import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

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
})

server.listen(8080, () => {
  console.log('Socket server is listening on port:8080')
})
