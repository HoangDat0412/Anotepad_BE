'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LoginHistory.init({
    user_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
    browser: DataTypes.STRING,
    os: DataTypes.STRING,
    platform: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LoginHistory',
  });
  return LoginHistory;
};