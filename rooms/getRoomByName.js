'use strict';

var self = getRoomByName;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var rooms = require('../models/rooms.js');

function getRoomByName(req, res) {
  var bag = {
    resBody: {},
    params: req.params
  };

  logger.info('Inside |rooms|getRoomByName');

  async.series([
      _checkInputParams.bind(null, bag),
      _getRoomByName.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |rooms|getRoomByName');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside |rooms|getRoomByName|_checkInputParams');

  return next();
}


function _getRoomByName(bag, next) {
  logger.verbose('Inside |rooms|getRoomByName|_getRoomByName');

  var query = {
    where: {
      name: bag.params.roomName
    }
  };


  rooms.findOne(query).asCallback(
    function (err, room) {
      if (err)
        return next({statusCode: 500, message: err});

      if (_.isEmpty(room))
        return next({statusCode: 400, message: 'No such room exists'});

      bag.resBody = room;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
