'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ratings = [
      { user_id: 16, tweet_id: 1, rating: 5 },
      { user_id: 16, tweet_id: 2, rating: 5 },
      { user_id: 16, tweet_id: 3, rating: 5 },
      { user_id: 16, tweet_id: 4, rating: 5 },
      { user_id: 16, tweet_id: 5, rating: 4 },
      { user_id: 16, tweet_id: 7, rating: 4 },
      { user_id: 16, tweet_id: 16, rating: 5 },
      { user_id: 16, tweet_id: 19, rating: 5 },
      { user_id: 17, tweet_id: 23, rating: 5 },
      { user_id: 17, tweet_id: 24, rating: 5 },
      { user_id: 17, tweet_id: 25, rating: 5 },
      { user_id: 17, tweet_id: 26, rating: 5 },
      { user_id: 17, tweet_id: 27, rating: 5 },
      { user_id: 17, tweet_id: 28, rating: 5 },
      { user_id: 17, tweet_id: 29, rating: 5 },
      { user_id: 17, tweet_id: 30, rating: 5 },
      { user_id: 18, tweet_id: 31, rating: 2 },
      { user_id: 18, tweet_id: 32, rating: 2 },
      { user_id: 18, tweet_id: 33, rating: 2 },
      { user_id: 18, tweet_id: 35, rating: 2 },
      { user_id: 18, tweet_id: 36, rating: 2 },
      { user_id: 18, tweet_id: 37, rating: 5 },
      { user_id: 18, tweet_id: 38, rating: 5 },
      { user_id: 18, tweet_id: 39, rating: 5 },
      { user_id: 18, tweet_id: 40, rating: 5 },
      { user_id: 18, tweet_id: 41, rating: 5 },
    ]
    await queryInterface.bulkInsert('ratings', ratings, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ratings', null, {})
  },
}
