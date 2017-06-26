'use strict';
var Sequelize = require('sequelize');
var _ = require('underscore');

var users = global.sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(255),
    field: 'name',
    allowNull: false
  },
  password: {
    type: Sequelize.STRING(255),
    password: 'password',
    allowNull: true
  },
  token: {
    type: Sequelize.STRING(36),
    field: 'token',
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: 'users',
  indexes: [
    {
      name: 'usernameU',
      fields: ['name'],
      unique: true
    },
    {
      name: 'userIdI',
      fields: ['id']
    }
  ]
});

module.exports = users;