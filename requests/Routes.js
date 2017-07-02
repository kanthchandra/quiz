'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = users;

function users(app) {
  app.get('/rooms/:roomId/requests', validateAccount,
  	require('./getAllRequests.js'));
}