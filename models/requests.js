'use strict';
var Sequelize = require('sequelize');
var _ = require('underscore');

var users = global.sequelize.define('requests', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  roomId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  roomName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  joinRequestApproved: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
}, {
  freezeTableName: true,
  tableName: 'requests',
  indexes: [
    {
      name: 'roomIdUserIdU',
      fields: ['roomId', 'userId'],
      unique: true
    },
    {
      name: 'roomIdRI',
      fields: ['roomId']
    }
  ]
});

module.exports = users;