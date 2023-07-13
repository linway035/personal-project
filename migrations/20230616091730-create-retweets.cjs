'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('retweets', {
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
      is_active: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.BOOLEAN,
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
    await queryInterface.addConstraint('retweets', {
      fields: ['user_id', 'tweet_id'],
      type: 'unique',
      name: 'unique_retweets',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('retweets')
  },
}
