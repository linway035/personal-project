import * as userModel from '../models/user.js'
import * as chatModel from '../models/chat.js'

const chatController = {
  getChatroom: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const currentUserData = await userModel.getCurrentUserData(currentUserID)
    res.render('chat', {
      user: currentUserData
    })
  },
  getRoomList: async (req, res, next) => {
    const currentUserID = res.locals.userId
    const chatUserLists = await chatModel.getChatUserLists(currentUserID)
    return res.json(chatUserLists)
  },
  getRoomMessages: async (req, res, next) => {
    const roomId = req.params.roomId
    const roomMessage = await chatModel.getRoomMessages(roomId)
    return res.json(roomMessage)
  },
  postReceiever: async (req, res, next) => {
    const senderId = Number(req.body.senderId)
    const receiverID = Number(req.body.receiverID)
    await chatModel.checkRoom(senderId, receiverID)
    const [smallerID, biggerID] = [
      Math.min(senderId, receiverID),
      Math.max(senderId, receiverID)
    ]
    const roomName = `${smallerID}-${biggerID}`
    const result = await chatModel.getNowReceiverData(receiverID)
    result.roomId = await chatModel.getRoomIdByRoomName(roomName)
    return res.status(200).json(result)
  }
}

export default chatController
