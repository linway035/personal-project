'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tweetLikes = []
    for (let i = 1; i <= 19; i++) {
      const like = {
        user_id: 18, //nba
        tweet_id: i,
      }
      tweetLikes.push(like)
    }
    for (let i = 23; i <= 30; i++) {
      const like = {
        user_id: 19, //music
        tweet_id: i,
      }
      tweetLikes.push(like)
    }
    for (let i = 31; i <= 41; i++) {
      const like = {
        user_id: 20, //pol
        tweet_id: i,
      }
      tweetLikes.push(like)
    }
    await queryInterface.bulkInsert('tweet_likes', tweetLikes, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tweet_likes', null, {})
  },
}
