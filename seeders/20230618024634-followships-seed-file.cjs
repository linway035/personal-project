'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const followships = [
      { follower_id: 1, following_id: 2 },
      { follower_id: 1, following_id: 3 },
      { follower_id: 1, following_id: 4 },
      { follower_id: 1, following_id: 5 },
      { follower_id: 1, following_id: 6 },
      { follower_id: 1, following_id: 7 },
      { follower_id: 2, following_id: 1 },
      { follower_id: 2, following_id: 3 },
      { follower_id: 2, following_id: 4 },
      { follower_id: 3, following_id: 4 },
      { follower_id: 3, following_id: 5 },
      { follower_id: 4, following_id: 3 },
      { follower_id: 4, following_id: 11 },
      { follower_id: 4, following_id: 12 },
      { follower_id: 5, following_id: 6 },
      { follower_id: 6, following_id: 5 },
      { follower_id: 8, following_id: 9 },
      { follower_id: 8, following_id: 10 },
      { follower_id: 9, following_id: 8 },
      { follower_id: 9, following_id: 10 },
      { follower_id: 10, following_id: 8 },
      { follower_id: 10, following_id: 9 },
      { follower_id: 11, following_id: 12 },
      { follower_id: 12, following_id: 11 },
      { follower_id: 13, following_id: 14 },
      { follower_id: 14, following_id: 13 },
      { follower_id: 16, following_id: 1 },
      { follower_id: 16, following_id: 2 },
      { follower_id: 16, following_id: 3 },
      { follower_id: 16, following_id: 4 },
      { follower_id: 16, following_id: 5 },
      { follower_id: 16, following_id: 6 },
      { follower_id: 17, following_id: 8 },
      { follower_id: 17, following_id: 9 },
      { follower_id: 17, following_id: 10 },
      { follower_id: 18, following_id: 11 },
      { follower_id: 18, following_id: 12 },
      { follower_id: 18, following_id: 13 },
      { follower_id: 18, following_id: 14 },
    ]
    await queryInterface.bulkInsert('followships', followships, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('followships', null, {})
  },
}
