import * as followshipModel from '../models/followship.js'
const followshipController = {
  postFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.body.id)
      if (currentUserID === followingId) {
        throw new Error('Cannot follow yourself!')
      }
      await followshipModel.postFollow(currentUserID, followingId)
      return res.json({ message: 'follow' })
    } catch (error) {
      next(error)
    }
  },
  unFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.params.id)
      await followshipModel.postUnfollow(currentUserID, followingId)
      return res.json({ message: 'unfollow' })
    } catch (error) {
      next(error)
    }
  },
  postProfileFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.body.id)
      if (currentUserID === followingId) {
        throw new Error('Cannot follow yourself!')
      }
      await followshipModel.postFollow(currentUserID, followingId)
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  unProfileFollowships: async (req, res, next) => {
    try {
      const currentUserID = res.locals.userId
      const followingId = Number(req.params.id)
      await followshipModel.postUnfollow(currentUserID, followingId)
      res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
}
export default followshipController
