'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskLists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TaskLists.init({
    note_id: {
      type:DataTypes.INTEGER,
      validate: {
        notEmpty: true
      },
    },
    content: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true, 
      },
    },
    status: {
      type:DataTypes.BOOLEAN,
      validate: {
        notEmpty: true
      },
    }, 
  }, {
    sequelize,
    modelName: 'TaskLists',
  });
  return TaskLists;
};