'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class reply_likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  reply_likes.init(
    {
      user_id: DataTypes.INTEGER,
      reply_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'reply_likes',
      tableName: 'reply_likes',
      underscored: true,
    }
  )
  return reply_likes
}
