'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = users;

function users(app) {
  app.get('/users/:userName', validateAccount,
    require('./getUserById.js'));
  app.post('/users', require('./post.js'));
}