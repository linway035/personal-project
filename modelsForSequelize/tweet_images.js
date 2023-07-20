'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class tweet_images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      tweet_images.belongsTo(models.tweets, { foreignKey: 'tweet_id' })
    }
  }
  tweet_images.init(
    {
      tweet_id: DataTypes.INTEGER,
      filename: DataTypes.STRING,
      image_path: DataTypes.STRING,
      size: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'tweet_images',
      tableName: 'tweet_images',
      underscored: true
    }
  )
  return tweet_images
}
