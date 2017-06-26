'use strict';

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  var statusCode = 500;
  logger.error('Unhandled error:', {
    user: req.user && req.user.id || 'Unauthenticated user',
    url: req.url,
    error: err,
    stack: err.stack
  });
  res.status(statusCode).send({});
}