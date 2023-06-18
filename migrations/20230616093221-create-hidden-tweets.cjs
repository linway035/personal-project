'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hidden_tweets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      tweet_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'tweets',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    })
    await queryInterface.addConstraint('hidden_tweets', {
      fields: ['user_id', 'tweet_id'],
      type: 'unique',
      name: 'unique_hidden_tweets',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hidden_tweets')
  },
}
