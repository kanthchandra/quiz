'use strict';
var Sequelize = require('sequelize');
var _ = require('underscore');

var questions = global.sequelize.define('questions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  question: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'question',
    get: function () {
      var val = this.getDataValue('question');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('question', val);
    }
  },
  optionA: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'optionA',
    get: function () {
      var val = this.getDataValue('optionA');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('optionA', val);
    }
  },
  optionB: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'optionB',
    get: function () {
      var val = this.getDataValue('optionB');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('optionB', val);
    }
  },
  optionC: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'optionC',
    get: function () {
      var val = this.getDataValue('optionC');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('optionC', val);
    }
  },
  optionD: {
    type: Sequelize.TEXT,
    allowNull: false,
    field: 'optionD',
    get: function () {
      var val = this.getDataValue('optionD');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('optionD', val);
    }
  },
  answer: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
}, {
  freezeTableName: true,
  tableName: 'questions',
  indexes: [
    {
      name: 'questionIdI',
      fields: ['id'],
      unique: true
    }
  ]
});


module.exports = questions;