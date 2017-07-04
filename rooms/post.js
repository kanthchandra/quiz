'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var rooms = require('../models/rooms.js');
var questions = require('../models/questions.js');

function post(req, res) {
  var bag = {
    req: req,
    reqBody: req.body,
    resBody: {}
  };

  logger.info('Inside |rooms|post');

  async.series([
      _checkInputParams.bind(null, bag),
      _getQuestions.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |rooms|post');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |rooms|post|_checkInputParams');

  if (!bag.reqBody)
    return next({statusCode: 400, message: 'Missing body'});

  if (!bag.reqBody.name)
    return next({statusCode: 400, message: 'Missing name'});

  if (!bag.reqBody.totalQuestions)
    return next({statusCode: 400, message: 'Missing totalQuestions'});

  if (!bag.reqBody.timePerQuestionInMinutes)
    return next({statusCode: 400, message: 'Missing timePerQuestionInMinutes'});

  if (!bag.reqBody.maxUsers)
    return next({statusCode: 400, message: 'Missing maxUsers'});

  return next();
}

function _getQuestions(bag, next) {
  logger.verbose('Inside |rooms|post|_getQuestions');
  var limit = 10;
  if (bag.reqBody.totalQuestions < limit);
    limit = bag.reqBody.totalQuestions;
  var query = {
    where: {},
    limit: limit
  };

  questions.findAll(query).asCallback(
    function (err, questions) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.questionIds = _.pluck(questions, 'id');
      return next();
    }
  );
}

function _post(bag, next) {
  logger.verbose('Inside |rooms|post|_post');


  var totalQuestions = 10;
  if (bag.reqBody.totalQuestions < totalQuestions);
    totalQuestions = bag.reqBody.totalQuestions;

  var timePerQuestionInMinutes = 1;
  if (bag.reqBody.timePerQuestionInMinutes < timePerQuestionInMinutes);
    timePerQuestionInMinutes = bag.reqBody.timePerQuestionInMinutes;

  var room = {
    name: bag.reqBody.name,
    totalQuestions: totalQuestions,
    maxUsers: bag.reqBody.maxUsers,
    timePerQuestionInMinutes: timePerQuestionInMinutes,
    ownerId: bag.req.user.id,
    totalUsers: 0,
    questionIds: bag.questionIds
  };

  rooms.create(room).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.resBody = room;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
