'use strict';

process.title = 'multiplayer quiz';
require('http').globalAgent.maxSockets = 10000;

var glob = require('glob');
var async = require('async');
var _ = require('underscore');
var express = require('express');
var Sequelize = require('sequelize');
require('pg').defaults.parseInt8 = true;
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var http = require('http');


require('./logger.js');
global.util = require('util');

process.on('uncaughtException',
  function (err) {
    return shutdown('uncaughtException thrown:', err);
  }
);

if (require.main === module) {
  init();
}

function init() {
  var bag = {
    app: global.app,
    config: {}
  };

  logger.debug('Initializing the app')

  async.series([
      createExpressApp.bind(null, bag),
      startListening.bind(null, bag),
      initializeDatabaseConfig.bind(null, bag),
      initializeSequelize.bind(null, bag),
      initializeRoutes.bind(null, bag)
    ],
    function (err) {
      if (err) {
        return shutdown(err)
      }
      global.app = bag.app;
      module.exports = bag.app;
      logger.debug('successfully started server')
    }
  );
}
function createExpressApp(bag, next) {
  logger.debug('Creating express application');
  var error;
  try {
    var app = express();

    app.use(require('body-parser').json({limit: '10mb'}));
    app.use(require('body-parser').urlencoded({limit: '10mb', extended: true}));
    app.use(cookieParser());
    app.use(require('./errorHandler.js'));
    app.use(express.static(path.join(__dirname, 'public')));
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    bag.app = app;
  } catch (err) {
    error = err;
  }

  return next(error);
}

function startListening(bag, next) {
  logger.debug('Creating a server');

  var listenAddr = '0.0.0.0';
  var port = 3000;

  bag.app.set('port', port);

  /**
   * Create HTTP server.
   */

  bag.server = http.createServer(bag.app);

  /**
   * Listen on provided port.
   */

  bag.server.listen(port, listenAddr, function (error) {
    if (error) {
      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          error.friendlyMessage = listenAddr + ':' + port + ' requires elevated privileges';
          return next(error);
          break;
        case 'EADDRINUSE':
          error.friendlyMessage = listenAddr + ':' + port + ' requires elevated privileges';
          return next(error);
          break;
        default:
          return next(error);
      }
    }
    logger.debug('Listening on ' + bag.server.address());
    return next();
  });
}

function initializeDatabaseConfig(bag, next) {
  logger.debug('Initializing database config');
  bag.config.dbName = 'quizDb';
  bag.config.dbUsername = 'quizuser';
  bag.config.dbPassword = 'quizzing';
  bag.config.dbHost = '0.0.0.0';
  bag.config.dbPort = 5432;
  bag.config.dbDialect = 'postgres';
  
  return next();
}

function initializeSequelize(bag, next) {
  logger.debug('Initializing sequelize');
  var sequelizeOptions = {
    host: bag.config.dbHost,
    dialect: bag.config.dbDialect,

    // Defaults from the documentation.
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },

    logging: logger.debug.bind(null, 'SEQUELIZE:')
  };

  var sequelize = new Sequelize(
    bag.config.dbName,
    bag.config.dbUsername,
    bag.config.dbPassword,
    sequelizeOptions);

  global.sequelize = sequelize;

  // Initialize all the models
  glob.sync('./models/*.js').forEach(
    function (schemaPath) {
      logger.debug('Initializing schema file', schemaPath);
      require(schemaPath);
    }
  );

  sequelize.sync().asCallback(
    function (err) {
      if (err) {
        logger.error(util.inspect(err, {depth: null}));
        return next(err)
      }

      logger.debug('SEQUELIZE: Synced successfully');
      return next();
    }
  );
}

function initializeRoutes(bag, next) {
  var who = 'api.app.js|' + initializeRoutes.name;
  logger.debug(who, 'Inside');

  glob.sync('./**/*Routes.js').forEach(
    function(routeFile) {
      require(routeFile)(bag.app);
    }
  );
  return next();
}

function shutdown(message, err) {
  logger.error(util.inspect(message, {depth: null}));

  if (err && err.message)
    logger.error(err.message);

  if (err && err.stack)
    logger.error(err.stack);

  setTimeout(
    function () {
      process.exit(1);
    },
    3000
  );
}
