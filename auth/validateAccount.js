'use strict';

var self = validateAccount;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var users = require('../models/users')

function validateAccount(req, res, next) {
  var bag = {
    req: req,
    token: null
  };

  logger.info('Inside |auth|validateAccount');

  async.series([
      _checkInputParams.bind(null, bag),
      _validateAccount.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |auth|validateAccount');
      if (err)
        return next(util.inspect(err));

      return next();
    }
  );
}

function _checkInputParams(bag, nextStep) {
  logger.verbose('Inside |auth|validateAccount|_checkInputParams');

  if (bag.req.headers.authorization &&
    bag.req.headers.authorization.indexOf('token') === 0) {
    var token = bag.req.headers.authorization.split(' ')[1];
    if (token && token.length === 0)
      return nextStep({statusCode: 401, message: 'Invalid token found in the headers'});
    logger.debug('Found token in Header');
    bag.token = token;
  } else {
    logger.debug('Failed to find apiToken in Header');
    return nextStep({statusCode: 401, message: 'Only Registered users are allowed to access this route'}); 
  }
  return nextStep();
}


function _validateAccount(bag, nextStep) {
  logger.verbose('Inside |auth|validateAccount|_validateAccount');

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
        return nextStep({statusCode: 401, message: 'Invalid token present in the headers'});

      bag.req.user = user;
      return nextStep();
    }
  )
}
