'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tweets = [
      {
        user_id: 17,
        content: `It's my favorite point guard Chris Paul!`,
      },
    ]
    const tweetImages = [
      {
        tweet_id: 90,
        filename: 'seed',
        image_path:
          'https://pbs.twimg.com/media/ERAiTd7UYAAWh_Y?format=jpg&name=900x900',
        size: 0,
      },
    ]
    await queryInterface.bulkInsert('tweets', tweets, {})
    await queryInterface.bulkInsert('tweet_images', tweetImages, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tweet_images', null, {})
    await queryInterface.bulkDelete('tweets', null, {})
  },
}
