'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = sessions;

function sessions(app) {
  app.get('/sessions/:sessionId', validateAccount,
    require('./getSessionById.js'));
  app.put('sessions/:sessionId', require('./updateSessionById.js'));
}