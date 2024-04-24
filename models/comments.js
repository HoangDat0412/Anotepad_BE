'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comments.init({
    note_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
    user_name:{
      type:DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    }, 
    comment: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    }
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};