'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class replies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      replies.belongsTo(models.users, { foreignKey: 'user_id' })
      replies.hasMany(models.reply_likes, { foreignKey: 'reply_id' })
      replies.belongsTo(models.tweets, { foreignKey: 'tweet_id' })

      replies.belongsTo(replies, { foreignKey: 'parent_id', as: 'parent' })
      replies.hasMany(replies, { foreignKey: 'parent_id', as: 'children' })
    }
  }
  replies.init(
    {
      tweet_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      content: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
      path: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'replies',
      tableName: 'replies',
      underscored: true
    }
  )
  return replies
}
