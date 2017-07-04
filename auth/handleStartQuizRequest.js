'use strict'

var self = handleStartQuizRequest
module.exports = self

var async = require('async')
var _ = require('underscore')
var users = require('../models/users')
var rooms = require('../models/rooms')
var sessions = require('../models/sessions')
var requests = require('../models/requests')
var questions = require('../models/questions')

function handleStartQuizRequest(requestObject, socket) {
  var bag = {
    roomname: requestObject.roomName,
    roomUrl: requestObject.roomUrl,
    username: requestObject.username,
    token: requestObject.token,
    socket: socket,
    questions: [],
    user: null,
    session: null,
    room: null,
    owner: null
  }

  logger.info('Inside |auth|handleStartQuizRequest')
  
  async.series([
      _getRoomByName.bind(null, bag),
      _checkInputParams.bind(null, bag),
      _validateAccount.bind(null, bag),
      _getQuestions.bind(null, bag),
      _sendQuizStartEvent.bind(null, bag),
      _sendQuestions.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |auth|handleStartQuizRequest')
      if (err)
        return logger.error(util.inspect(err))
    }
  )
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_checkInputParams')

  if (bag.token && bag.token.length === 0)
    return next({statusCode: 401, message: 'Invalid token found in the socket request'})

  return next()
}

function _getRoomByName(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_getRoomByName')

  var query = {
    where: {
      name: bag.roomname
    }
  }

  rooms.findOne(query).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err})

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'})

      bag.room = room

      return next()
    }
  )
}

function _validateAccount(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_validateAccount')

  var query = {
    where: {
      token: bag.token
    }
  }

  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err})

      if (_.isEmpty(user))
        return next({statusCode: 401, message: 'No such token found in the system'})

      if (bag.room.ownerId !== user.id) {
        return next({statusCode: 401, message: 'No such user found in the system'})
      }

      bag.owner = user

      return next()
    }
  )
}

function _getQuestions(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_getQuestions')

  var query = {
    where: {}
  }
  query.where.id = {
    $in: bag.room.questionIds
  }

  questions.findAll(query).asCallback(
    function (err, questions) {
      if (err)
        return next({statusCode: 500, message: err})

      if (_.isEmpty(questions))
        return next({statusCode: 401, message: 'No questions found in the system'})

      _.each(questions, function (q) {
        var obj = {
          id: q.dataValues.id,
          question: q.dataValues.question,
          optionA: q.dataValues.optionA,
          optionB: q.dataValues.optionB,
          optionC: q.dataValues.optionC,
          optionD: q.dataValues.optionD,
        }
        bag.questions.push(obj)
      })

      return next()
    }
  )
}

function _updateSession(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_updateSession')

  var query = {
    where: {
      roomId: bag.room.id
    }
  }

  var update = {
    startedAt: new Date()
  }

  sessions.update(update, query).asCallback(
    function (err, session) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.session = session
      return next()
    }
  )
}

function _updateRooms(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_updateRooms')

  var update = {}
  update.startedAt = new Date()

  bag.room.update(update).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err})

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'})

      bag.room = room
      return next()
    }
  )
}

function _sendQuizStartEvent(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_sendQuizStartEvent')

  io.sockets.in(bag.roomUrl).emit('quiz:announcement',
    {message: 'Quiz will start in 10 seconds.'+
    ' You will have ' + bag.room.timePerQuestionInMinutes * 60 +
    ' seconds to answer each questions',
    userName: bag.owner.name,
    roomName: bag.room.name})

  setTimeout(function() {
    return next()
  }, 1000)

}

function _sendQuestions(bag, next) {
  logger.verbose('Inside |auth|handleStartQuizRequest|_sendQuestions')
  var questionsCompleted = 0
  async.eachSeries(bag.questions, function(question, nextQuestion) {
    io.sockets.in(bag.roomUrl).emit('quiz:questions',
      {message: question,
      userName: bag.owner.name,
      roomName: bag.room.name})

    questionsCompleted = questionsCompleted + 1
    setTimeout(function() {
      return nextQuestion()
    }, bag.room.timePerQuestionInMinutes * 10 * 1000)

    var query = {
      where: {
        roomId: bag.room.id
      }
    }

    var update = {
      questionsCompleted: questionsCompleted
    }

    sessions.update(update, query).asCallback(
      function () {
        logger.debug('updated questionsCompleted')
      }
    )
  }, function(){
    return next()
  })

}


