'use strict';

var self = getAllsessions;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var sessions = require('../models/sessions.js');

function getAllsessions(req, res) {
  var bag = {
    params: req.params,
    resBody: []
  };

  logger.info('Inside |sessions|getAllsessions');

  async.series([
      _checkInputParams.bind(null, bag),
      _getAllsessions.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |sessions|getAllsessions');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside ||sessions|getAllsessions|_checkInputParams');
  return next();
}


function _getAllsessions(bag, next) {
  logger.verbose('Inside |sessions|getAllsessions|_getAllsessions');

  var query = {
    where: {
      roomId: bag.params.roomId
    }
  };
  sessions.findAll(query).asCallback(
    function (err, sessions) {
      if (err)
        return next({statusCode: 500, message: err});

      bag.resBody = sessions;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
