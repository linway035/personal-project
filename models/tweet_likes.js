'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class tweet_likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tweet_likes.belongsTo(models.users, { foreignKey: 'user_id' })
    }
  }
  tweet_likes.init(
    {
      user_id: DataTypes.INTEGER,
      tweet_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'tweet_likes',
      tableName: 'tweet_likes',
      underscored: true,
    }
  )
  return tweet_likes
}
