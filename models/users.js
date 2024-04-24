'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false, 
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false, 
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "GUEST",
      validate: {
        notEmpty: true, 
        isIn: [["GUEST","USER","ADMIN"]],
      }  
    },
    cookie: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false, 
      },
    },
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};