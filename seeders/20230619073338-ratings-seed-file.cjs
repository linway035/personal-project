'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    const numTweets = 41
    const minRatings = 1
    const maxRatings = 30

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

    // nba (1~19)
    for (let user_id = 1; user_id <= 6; user_id++) {
      const numRatings = getRandomInt(minRatings, maxRatings) // 評分次數

      const tweetIndices = Array.from(
        { length: numTweets },
        (_, index) => index + 1
      ) //做了個1~41的骰子，因為最後會移除評分過的

      for (let i = 0; i < numRatings; i++) {
        const randomIndex = getRandomInt(0, tweetIndices.length - 1)
        const tweet_id = tweetIndices[randomIndex]

        ratings.push({
          user_id,
          tweet_id,
          rating: tweet_id >= 1 && tweet_id <= 19 ? 5 : 1,
        })

        tweetIndices.splice(randomIndex, 1) // 移除已評過的
      }
    }
    // NASA NOBODY CARE
    // MUSIC (23~30)
    for (let user_id = 8; user_id <= 10; user_id++) {
      const numRatings = getRandomInt(minRatings, maxRatings)

      const tweetIndices = Array.from(
        { length: numTweets },
        (_, index) => index + 1
      )
      console.log('tweetIndices', tweetIndices)

      for (let i = 0; i < numRatings; i++) {
        const randomIndex = getRandomInt(0, tweetIndices.length - 1)
        const tweet_id = tweetIndices[randomIndex]

        ratings.push({
          user_id,
          tweet_id,
          rating: tweet_id >= 23 && tweet_id <= 30 ? 5 : 1,
        })

        tweetIndices.splice(randomIndex, 1) // 移除已評過的
      }
    }

    // POL (31~41)
    for (let user_id = 11; user_id <= 14; user_id++) {
      const numRatings = getRandomInt(minRatings, maxRatings) // 評分次數

      const tweetIndices = Array.from(
        { length: numTweets },
        (_, index) => index + 1
      )
      console.log('tweetIndices', tweetIndices)

      for (let i = 0; i < numRatings; i++) {
        const randomIndex = getRandomInt(0, tweetIndices.length - 1)
        const tweet_id = tweetIndices[randomIndex]

        ratings.push({
          user_id,
          tweet_id,
          rating: tweet_id >= 31 && tweet_id <= 41 ? 5 : 1,
        })

        tweetIndices.splice(randomIndex, 1) // 移除已評過的
      }
    }

    await queryInterface.bulkInsert('ratings', ratings, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ratings', null, {})
  },
}
