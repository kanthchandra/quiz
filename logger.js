'use strict';
var winston = require('winston');
var WinstonFileTransport = winston.transports.File;
var WinstonConsoleTransport = winston.transports.Console;

configLevel();

exports = winston;
module.exports = winston;
global.logger = winston;

exports.configLevel = configLevel;

function configLevel() {
  winston.clear();

  var logLevel = 'debug';

  winston.add(WinstonConsoleTransport, {
    timestamp: true,
    colorize: true,
    level: logLevel
  });

  winston.add(WinstonFileTransport, {
    name: 'file#out',
    timestamp: true,
    colorize: true,
    filename: 'logs/debug_out.log',
    maxsize: 10485760,// maxsize: 10mb
    maxFiles: 20,
    level: logLevel,
    json: false
  });

  winston.add(WinstonFileTransport, {
    name: 'file#err',
    timestamp: true,
    colorize: true,
    filename: 'logs/err_out.log',
    maxsize: 10485760,// maxsize: 10mb
    maxFiles: 20,
    level: 'error',
    json: false
  });

  winston.add(WinstonFileTransport, {
    name: 'file#warn',
    timestamp: true,
    colorize: true,
    filename: 'logs/warn_out.log',
    maxsize: 5242880,// maxsize: 5mb
    maxFiles: 20,
    level: 'warn',
    json: false
  });
}