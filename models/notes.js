'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notes.init({
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true, 
      },
    },
    note_type: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isIn: [["SimpleNote","RichNote","TaskList"]],
      },
    },
    folder_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: false
      },
    },
    user_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
    highlight: {
      type:DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true, 
        isIn: [["public","private","protected"]],
      },
    },
    password_access: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false, 
      },
    },
    password_edit: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false, 
      },
    },
  }, {
    sequelize,
    modelName: 'Notes',
  });
  return Notes;
};