'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class replies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  replies.init(
    {
      tweet_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      content: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
      path: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'replies',
      tableName: 'replies',
      underscored: true,
    }
  )
  return replies
}
