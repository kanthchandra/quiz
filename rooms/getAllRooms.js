'use strict';

var self = getAllRooms;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var rooms = require('../models/rooms.js');

function getAllRooms(req, res) {
  var bag = {
    req: req,
    resBody: []
  };

  logger.info('Inside |rooms|getAllRooms');

  async.series([
      _checkInputParams.bind(null, bag),
      _getAllRooms.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |rooms|getAllRooms');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside ||rooms|getAllRooms|_checkInputParams');
  if (bag.req.headers.authorization &&
    bag.req.headers.authorization.indexOf('token') === 0) {
    var token = bag.req.headers.authorization.split(' ')[1];
    if (token && token.length === 0)
      return next({statusCode: 401, message: 'Invalid token found in the headers'});
    logger.debug('Found token in Header');
    return next();
  } else {
    logger.debug('Failed to find apiToken in Header');
    return next({statusCode: 401, message: 'Only Registered users are allowed to access this route'}); 
  }
}


function _getAllRooms(bag, next) {
  logger.verbose('Inside |rooms|getAllRooms|_getAllRooms');

  rooms.findAll({}).asCallback(
    function (err, rooms) {
      if (err)
        return next({statusCode: 500, message: err});

      bag.resBody = rooms;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
