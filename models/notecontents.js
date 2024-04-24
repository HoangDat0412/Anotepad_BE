'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NoteContents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NoteContents.init({
    note_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
    content:{
      type:DataTypes.TEXT,
      validate: {
        notEmpty: true
      },
    }, 
  }, {
    sequelize,
    modelName: 'NoteContents',
  });
  return NoteContents;
};