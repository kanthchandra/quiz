'use strict';

var self = getAllrequests;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var requests = require('../models/requests.js');

function getAllrequests(req, res) {
  var bag = {
    params: req.params,
    resBody: []
  };

  logger.info('Inside |requests|getAllrequests');

  async.series([
      _checkInputParams.bind(null, bag),
      _getAllrequests.bind(null, bag)
    ],
    function (err) {
      logger.info('Completed |requests|getAllrequests');
      if (err)
        return res.status(err.statusCode).json(err);

      res.status(bag.resBody.statusCode).json(bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  logger.verbose('Inside ||requests|getAllrequests|_checkInputParams');
  return next();
}


function _getAllrequests(bag, next) {
  logger.verbose('Inside |requests|getAllrequests|_getAllrequests');

  var query = {
    where: {
      roomId: bag.params.roomId
    }
  };
  requests.findAll(query).asCallback(
    function (err, requests) {
      if (err)
        return next({statusCode: 500, message: err});

      bag.resBody = requests;
      bag.resBody.statusCode = 200;
      return next();
    }
  );
}
