'use strict';

var self = login;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var users = require('../models/users.js');

function login(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  logger.info('Inside |users|login');

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |users|login');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |users|login|_checkInputParams');

  if (!bag.reqBody)
    return next({statusCode: 400, message: 'Missing body'});

  if (!bag.reqBody.username)
    return next({statusCode: 400, message: 'Missing username'});

  if (!bag.reqBody.password)
    return next({statusCode: 400, message: 'Missing password'});
  return next();
}


function _post(bag, next) {
  logger.verbose('Inside |users|login|_post');

  var query = {
    where: {
      name: bag.reqBody.username,
      password: bag.reqBody.password
    }
  };


  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(user))
        return next({statusCode: 400, message: 'Incorrect username or password'});

      bag.resBody = user;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
