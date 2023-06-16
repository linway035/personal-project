'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ratings', {
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
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      rating: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    //validate 失效，故採用新增限制
    await queryInterface.addConstraint('ratings', {
      fields: ['rating'],
      type: 'check',
      where: {
        rating: {
          [Sequelize.Op.between]: [1, 5],
        },
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ratings')
  },
}
