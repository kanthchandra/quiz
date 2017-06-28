'use strict';

var self = handleJoinRequest;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var users = require('../models/users');
var rooms = require('../models/rooms');
var sessions = require('../models/sessions');

function handleJoinRequest(requestObject, socket) {
  var bag = {
    roomname: requestObject.roomName,
    roomUrl: requestObject.room,
    type: requestObject.type,
    username: requestObject.username,
    token: requestObject.token,
    socket: socket,
    user: null,
    session: null,
    room: null,
    skipAllSteps: false
  };

  logger.info('Inside |auth|handleJoinRequest');
  
  async.series([
      _checkInputParams.bind(null, bag),
      _validateAccount.bind(null, bag),
      _getRoomByName.bind(null, bag),
      _getSessionByRoomIdAndUserId.bind(null, bag),
      _updateRooms.bind(null, bag),
      _createSession.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |auth|handleJoinRequest');
      if (err)
        return logger.error(util.inspect(err));

      if (bag.type === 'room') {
        bag.socket.join(bag.roomUrl);
        io.sockets.in(bag.roomUrl).emit('quiz:joined',
          {message: bag.user.name + ' joined room ' + bag.room.name});
      }
    }
  );
}

function _checkInputParams(bag, nextStep) {
  logger.verbose('Inside |auth|handleJoinRequest|_checkInputParams');

  if (bag.token && bag.token.length === 0)
    return nextStep({statusCode: 401, message: 'Invalid token found in the socket request'});

  return nextStep();
}


function _validateAccount(bag, nextStep) {
  logger.verbose('Inside |auth|handleJoinRequest|_validateAccount');

  var query = {
    where: {
      token: bag.token
    }
  };

  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return nextStep({statusCode: 500, message: err});

      if (_.isEmpty(user))
        return nextStep({statusCode: 401, message: 'No such token found in the system'});

      bag.user = user;

      if (bag.type === 'user'){
        if (user.name === bag.username) {
          bag.socket.join(bag.roomUrl);
          io.sockets.in(bag.roomUrl).emit('user:joined',
            {message: 'user room joined successfully'});
        }
        bag.skipAllSteps = true;
      }
      return nextStep();
    }
  )
}

function _getRoomByName(bag, next) {
  if (bag.skipAllSteps) return next();
  logger.verbose('Inside |auth|handleJoinRequest|_getRoomByName');

  var query = {
    where: {
      name: bag.roomname
    }
  };

  rooms.findOne(query).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'});

      bag.room = room;

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'});

      if (room.totalUsers >= room.maxUsers) {
        io.sockets.in(room.name).emit('error:join', {message: 'Room cannot accomodate any more users'});
        return next({statusCode: 400, message: 'Room cannot accomodate any more users'});
      }
      return next();
    }
  );
}

function _getSessionByRoomIdAndUserId(bag, next) {
  if (bag.skipAllSteps) return next();
  logger.verbose('Inside |auth|handleJoinRequest|_getSessionByRoomIdAndUserId');

  var query = {
    where: {
      userId: bag.user.id,
      roomId: bag.room.id
    }
  };

  sessions.findOne(query).asCallback(
    function (err, session) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(session)) {
        bag.shouldCreateSession = true;
        return next ();
      }

      bag.session = session;
      return next();
    }
  );
}


function _updateRooms(bag, next) {
  if (bag.skipAllSteps) return next();
  if (!bag.shouldCreateSession)
    return next();

  logger.verbose('Inside |auth|handleJoinRequest|_updateRooms');

  var update = {};
  update.totalUsers = bag.room.totalUsers + 1;

  bag.room.update(update).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'});

      if (room.totalUsers >= room.maxUsers) {
        io.socket.in(room).emit('error:join', {message: 'Room cannot accomodate any more users'});
        return next({statusCode: 400, message: 'Room cannot accomodate any more users'});
      }

      bag.room = room;
      return next();
    }
  );
}

function _createSession(bag, next) {
  if (bag.skipAllSteps) return next();
  if (!bag.shouldCreateSession)
    return next();

  logger.verbose('Inside |auth|handleJoinRequest|_createSession');
  var session = {
    userId: bag.user.id,
    roomId: bag.room.id,
    joinedAt: new Date(),
    questionsCompleted: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
    questionsUnattempted: 0,
    joinRequestApproved: false,
    startedAt: null,
    submittedAnswers: {}
  };

  sessions.create(session).asCallback(
    function (err, session) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.session = session;
      return next();
    }
  );
}
