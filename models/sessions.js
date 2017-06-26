'use strict';
var Sequelize = require('sequelize');
var _ = require('underscore');
var users = require('./users.js');
var rooms = require('./rooms.js');

var sessions = global.sequelize.define('sessions', {
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
  joinedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  questionsCompleted: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  questionsAttempted: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  questionsCorrect: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  questionsUnattempted: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  startedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  joinRequestApproved: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  submittedAnswers: {
    type: Sequelize.TEXT,
    get: function() {
      var pb = this.getDataValue('submittedAnswers');
      if (!_.isEmpty(pb))
        pb = JSON.parse(pb);
      return pb;
    },
    set: function(val) {
      if (_.isObject(val))
        val = JSON.stringify(val);
      this.setDataValue('submittedAnswers', val);
    }
  }
}, {
  freezeTableName: true,
  tableName: 'sessions',
  indexes: [
    {
      name: 'sessionsUserIdI',
      fields: ['userId'],
      unique: true
    },
    {
      name: 'sessionsRoomIdI',
      fields: ['roomId']
    }
  ]
});

sessions.belongsTo(users, { foreignKey: 'userId',
  onUpdate: 'RESTRICT', onDelete: 'RESTRICT' });

sessions.belongsTo(rooms, { foreignKey: 'roomId',
  onUpdate: 'RESTRICT', onDelete: 'RESTRICT' });

module.exports = sessions;