'use strict';

var self = handlePermissionApprovedRequest;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var users = require('../models/users');
var rooms = require('../models/rooms');
var sessions = require('../models/sessions');
var requests = require('../models/requests');

function handlePermissionApprovedRequest(requestObject, socket) {
  var bag = {
    roomname: requestObject.roomName,
    roomUrl: requestObject.roomUrl,
    username: requestObject.username,
    token: requestObject.token,
    socket: socket,
    user: null,
    session: null,
    room: null,
    owner: null,
    shouldCreateSession: false
  };

  logger.info('Inside |auth|handlePermissionApprovedRequest');
  
  async.series([
      _getRoomByName.bind(null, bag),
      _checkInputParams.bind(null, bag),
      _validateAccount.bind(null, bag),
      _getUser.bind(null, bag),
      _getSessionByRoomIdAndUserId.bind(null, bag),
      _updateRooms.bind(null, bag),
      _updateRequest.bind(null, bag),
      _createSession.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |auth|handlePermissionApprovedRequest');
      if (err)
        return logger.error(util.inspect(err));

      if (bag.session && bag.session.joinRequestApproved) {
        logger.error('Allowing user to join quiz room');
        bag.socket.join(bag.roomUrl);
        io.sockets.in(bag.roomUrl).emit('quiz:joined',
          {message: bag.user.name + ' joined room ' + bag.room.name,
          userName: bag.user.name,
          roomName: bag.room.name});
      }
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_checkInputParams');

  if (bag.token && bag.token.length === 0)
    return next({statusCode: 401, message: 'Invalid token found in the socket request'});

  return next();
}

function _getRoomByName(bag, next) {
  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_getRoomByName');

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

      return next();
    }
  );
}

function _validateAccount(bag, next) {
  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_validateAccount');

  var query = {
    where: {
      token: bag.token
    }
  };

  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(user))
        return next({statusCode: 401, message: 'No such token found in the system'});

      if (bag.room.ownerId !== user.id) {
        return next({statusCode: 401, message: 'No such user found in the system'});
      }

      bag.owner = user;

      return next();
    }
  );
}

function _getUser(bag, next) {
  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_getUser');

  var query = {
    where: {
      name: bag.username
    }
  };

  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(user))
        return next({statusCode: 401, message: 'No such token found in the system'});

      bag.user = user;

      return next();
    }
  );
}

function _getSessionByRoomIdAndUserId(bag, next) {
  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_getSessionByRoomIdAndUserId');

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
  if (!bag.shouldCreateSession)
    return next();

  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_updateRooms');

  if (bag.room.totalUsers >= bag.room.maxUsers) {
    io.sockets.in('/users/' + bag.username).emit('error:join', {message: 'Room cannot accomodate any more users'});
    return next({statusCode: 400, message: 'Room cannot accomodate any more users'});
  }

  var update = {};
  update.totalUsers = bag.room.totalUsers + 1;

  bag.room.update(update).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'});

      bag.room = room;
      return next();
    }
  );
}

function _updateRequest(bag, next) {
  if (!bag.shouldCreateSession)
    return next();

  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_createRequest');

  var request = {
    userId: bag.user.id,
    roomId: bag.room.id,
    roomName: bag.room.name,
    userName: bag.user.name,
    joinRequestApproved: true
  };

  var query = {
    where: {
      userId: bag.user.id,
      roomId: bag.room.id
    }
  }

  requests.update(request, query).asCallback(
    function (err) {
      // if (err)
      //   return next({statusCode: 500, message: err})

      return next();
    }
  );
}

function _createSession(bag, next) {
  if (!bag.shouldCreateSession)
    return next();

  logger.verbose('Inside |auth|handlePermissionApprovedRequest|_createSession');

  var session = {
    userId: bag.user.id,
    roomId: bag.room.id,
    roomName: bag.room.name,
    userName: bag.user.name,
    joinedAt: new Date(),
    questionsCompleted: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
    questionsUnattempted: 0,
    joinRequestApproved: true,
    startedAt: null,
    submittedAnswers: []
  };

  sessions.create(session).asCallback(
    function (err, session) {
      if (err) {
        io.sockets.in('/users/' + bag.user.name).emit('error:join',
          {message: 'A player is allowed to play only one quiz at a time.'});
        return next({statusCode: 500, message: err})
      }

      bag.session = session;
      return next();
    }
  );
}
