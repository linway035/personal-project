'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class retweets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      retweets.belongsTo(models.users, { foreignKey: 'user_id' })
      retweets.belongsTo(models.tweets, { foreignKey: 'tweet_id' })
    }
  }
  retweets.init(
    {
      user_id: DataTypes.INTEGER,
      tweet_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'retweets',
      tableName: 'retweets',
      underscored: true,
    }
  )
  return retweets
}
