'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessNotes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AccessNotes.init({
    note_id: {
      type:DataTypes.INTEGER,
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
    permission: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: true,
        isIn: [["ACCESS","EDIT","ALL"]],
      },
    }
  }, {
    sequelize,
    modelName: 'AccessNotes',
  });
  return AccessNotes;
};