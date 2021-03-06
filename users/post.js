'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var users = require('../models/users.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    token: uuid.v4(),
    resBody: {}
  };

  logger.info('Inside |users|post');

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |users|post');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |users|post|_checkInputParams');

  if (!bag.reqBody)
    return next({statusCode: 400, message: 'Missing body'});

  if (!bag.reqBody.username)
    return next({statusCode: 400, message: 'Missing username'});

  if (!bag.reqBody.password)
    return next({statusCode: 400, message: 'Missing password'});
  return next();
}


function _post(bag, next) {
  logger.verbose('Inside |users|post|_post');

  var user = {
    name: bag.reqBody.username,
    token: bag.token,
    password: bag.reqBody.password
  };


  users.create(user).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err})

      bag.resBody = user;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
