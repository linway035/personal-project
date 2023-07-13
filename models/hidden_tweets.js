'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class hidden_tweets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      hidden_tweets.belongsTo(models.users, { foreignKey: 'user_id' })
      hidden_tweets.belongsTo(models.tweets, { foreignKey: 'tweet_id' })
    }
  }
  hidden_tweets.init(
    {
      user_id: DataTypes.INTEGER,
      tweet_id: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'hidden_tweets',
      tableName: 'hidden_tweets',
      underscored: true
    }
  )
  return hidden_tweets
}
