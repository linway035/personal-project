'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reply_likes', {
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
      reply_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'replies',
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
    await queryInterface.addConstraint('reply_likes', {
      fields: ['user_id', 'reply_id'],
      type: 'unique',
      name: 'unique_user_reply',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reply_likes')
  },
}
