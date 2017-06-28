'use strict';

var self = getUserByName;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var users = require('../models/users.js');

function getUserByName(req, res) {
  var bag = {
    resBody: {},
    req: req,
    params: req.params
  };

  logger.info('Inside |users|getUserByName');

  async.series([
      _checkInputParams.bind(null, bag),
      _getUserByName.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |users|getUserByName');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |users|getUserByName|_checkInputParams');

  return next();
}


function _getUserByName(bag, next) {
  logger.verbose('Inside |users|getUserByName|_getUserByName');

  var query = {
    where: {
      name: bag.params.userName
    }
  };


  users.findOne(query).asCallback(
    function (err, user) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(user))
        return next({statusCode: 400, message: 'No such user exists'});

      if (bag.req.user.name !== user.name)
        return next({statusCode: 401, message: 'No such user exists'});

      bag.resBody = user;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
