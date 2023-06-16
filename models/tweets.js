'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class tweets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tweets.belongsTo(models.users, { foreignKey: 'user_id' })
      tweets.hasMany(models.tweet_likes, { foreignKey: 'tweet_id' })
      tweets.hasMany(models.replies, { foreignKey: 'tweet_id' })
    }
  }
  tweets.init(
    {
      user_id: DataTypes.INTEGER,
      content: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'tweets',
      tableName: 'tweets',
      underscored: true,
    }
  )
  return tweets
}
