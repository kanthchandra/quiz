'use strict'

var self = handleAnswerQuestionEvent
module.exports = self

var async = require('async')
var _ = require('underscore')
var users = require('../models/users')
var rooms = require('../models/rooms')
var sessions = require('../models/sessions')
var requests = require('../models/requests')
var questions = require('../models/questions')

function handleAnswerQuestionEvent(requestObject, socket) {
  var bag = {
    roomname: requestObject.roomName,
    roomUrl: requestObject.roomUrl,
    username: requestObject.username,
    token: requestObject.token,
    answerOption: requestObject.answerOption,
    questionId: requestObject.questionId,
    socket: socket,
    questions: [],
    user: null,
    session: null,
    room: null,
    owner: null
  }

  logger.info('Inside |auth|handleAnswerQuestionEvent')
  
  async.series([
      _getRoomByName.bind(null, bag),
      _checkInputParams.bind(null, bag),
      _validateAccount.bind(null, bag),
      _getQuestion.bind(null, bag),
      _findSession.bind(null, bag),
      _updateSession.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |auth|handleAnswerQuestionEvent')
      if (err)
        return logger.error(util.inspect(err))
    }
  )
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_checkInputParams')

  if (bag.token && bag.token.length === 0)
    return next({statusCode: 401, message: 'Invalid token found in the socket request'})

  return next()
}

function _getRoomByName(bag, next) {
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_getRoomByName')

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
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_validateAccount')

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

      bag.user = user

      return next()
    }
  )
}

function _getQuestion(bag, next) {
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_getQuestion')

  var query = {
    where: {}
  }
  query.where.id = bag.questionId;

  questions.findOne(query).asCallback(
    function (err, question) {
      if (err)
        return next({statusCode: 500, message: err})

      if (_.isEmpty(questions))
        return next({statusCode: 401, message: 'No questions found in the system'})

      bag.question = question;

      return next()
    }
  )
}

function _findSession(bag, next) {
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_findSession')

  var query = {
    where: {
      roomId: bag.room.id,
      userId: bag.user.id
    }
  }

  sessions.findOne(query).asCallback(
    function (err, session) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.session = session
      return next()
    }
  )
}

function _updateSession(bag, next) {
  logger.verbose('Inside |auth|handleAnswerQuestionEvent|_updateSession')

  var query = {
    where: {
      roomId: bag.room.id,
      userId: bag.user.id
    }
  }
  var update = {}

  var currentAnswer = {
    questionId: bag.questionId,
    answerOption: bag.answerOption
  }

  if (bag.question.answer === bag.answerOption)
    update.questionsCorrect = bag.session.questionsCompleted + 1; 

  update.questionsCompleted = bag.session.questionsCompleted + 1;
  update.questionsAttempted = bag.session.questionsAttempted + 1; 

  bag.session.update(update, query).asCallback(
    function (err, session) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.session = session
      return next()
    }
  )
}
