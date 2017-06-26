'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = users;

function users(app) {
  app.get('/users/:userName', validateAccount,
    require('./getUserById.js'));
  app.get('/', require('./index.js'));
  app.post('/users', require('./post.js'));
  app.post('/users/authenticate', require('./login.js'));
}