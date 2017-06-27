'use strict';
var Sequelize = require('sequelize');
var _ = require('underscore');
var users  =require('./users.js');

var rooms = global.sequelize.define('rooms', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  totalUsers: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  ownerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(255),
    field: 'name',
    allowNull: false
  },
  totalQuestions: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  maxUsers: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  timePerQuestionInMinutes: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  startedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  questionIds: {
    type: Sequelize.TEXT,
    field: 'questionIds',
    get: function () {
      var val = this.getDataValue('questionIds');
      if (!_.isEmpty(val))
        val = JSON.parse(val);
      return val;
    },
    set: function (val) {
      if (_.isArray(val))
        val = JSON.stringify(val);
      this.setDataValue('questionIds', val);
    }
  },
}, {
  freezeTableName: true,
  tableName: 'rooms',
  indexes: [
    {
      name: 'roomnameU',
      fields: ['name'],
      unique: true
    },
    {
      name: 'ownerIdI',
      fields: ['ownerId'],
      unique: true
    }
  ]
});

rooms.belongsTo(users, { foreignKey: 'ownerId',
  onUpdate: 'RESTRICT', onDelete: 'RESTRICT' });

module.exports = rooms;