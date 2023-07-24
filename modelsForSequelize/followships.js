'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class followships extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  followships.init(
    {
      follower_id: DataTypes.INTEGER,
      following_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'followships',
      tableName: 'followships',
      underscored: true
    }
  )
  return followships
}
