import pool from '../middleware/databasePool.js'

const chatController = {
  getApi: async (req, res, next) => {
    res.render('chat')
  },
  getRoomList: async (req, res, next) => {
    const chatUserLists = [
      {
        user_id: 17,
        room_id: 1,
        roomName: 'user0-1',
        receiver: 1,
        name: 'USER1',
        avatar: 'USER1',
      },
      {
        user_id: 17,
        room_id: 2,
        roomName: 'user0-2',
        receiver: 2,
        name: 'USER2',
        avatar: 'USER2',
      },
      {
        user_id: 17,
        room_id: 3,
        roomName: 'user0-3',
        receiver: 3,
        name: 'USER3',
        avatar: 'USER3',
      },
      {
        user_id: 17,
        room_id: 4,
        roomName: 'user0-4',
        receiver: 4,
        name: 'USER4',
        avatar: 'USER4',
      },
      {
        user_id: 17,
        room_id: 5,
        roomName: 'user0-5',
        receiver: 5,
        name: 'USER5',
        avatar: 'USER5',
      },
    ]
    res.json(chatUserLists)
  },
  getRoomMessages: async (req, res, next) => {
    const roomId = req.params.roomId
    const roomMessageall = [
      {
        id: 1,
        room_id: 1,
        user_id: 17,
        message: 'hi im17',
      },
      {
        id: 2,
        room_id: 1,
        user_id: 1,
        message: 'user1 to 17',
      },
      {
        id: 3,
        room_id: 2,
        user_id: 17,
        message: 'hi im17',
      },
      {
        id: 4,
        room_id: 2,
        user_id: 2,
        message: 'user2 to 17',
      },
      {
        id: 5,
        room_id: 2,
        user_id: 17,
        message: 'hi im17 too',
      },
      {
        id: 6,
        room_id: 3,
        user_id: 3,
        message: 'user3 user3',
      },
    ]

    const roomMessage = [
      {
        id: 3,
        room_id: 2,
        user_id: 17,
        message: 'hi im17',
      },
      {
        id: 4,
        room_id: 2,
        user_id: 2,
        message: 'user2 to 17',
      },
      {
        id: 5,
        room_id: 2,
        user_id: 17,
        message: 'hi im17 too',
      },
    ]

    const filteredMessages = roomMessageall.filter(
      message => message.room_id === Number(roomId)
    )

    res.json(filteredMessages)
  },
}

export default chatController
