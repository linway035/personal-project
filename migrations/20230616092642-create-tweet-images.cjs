'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tweet_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tweet_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      filename: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      image_path: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      size: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tweet_images')
  },
}
