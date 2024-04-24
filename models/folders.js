'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Folders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Folders.init({
    name:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    user_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
  }, {
    sequelize,
    modelName: 'Folders',
  });
  return Folders;
};