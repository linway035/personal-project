'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      users.belongsToMany(models.users, {
        through: models.followships,
        foreignKey: 'follower_id',
        as: 'followings',
      })
      users.belongsToMany(models.users, {
        through: models.followships,
        foreignKey: 'following_id',
        as: 'followers',
      })
      users.hasMany(models.tweets, { foreignKey: 'user_id' })
      users.hasMany(models.replies, { foreignKey: 'user_id' })
    }
  }
  users.init(
    {
      provider: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      avatar: DataTypes.STRING,
      cover: DataTypes.STRING,
      bio: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'users',
      tableName: 'users',
      underscored: true,
    }
  )
  return users
}
