'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = users;

function users(app) {
  app.post('/rooms/:roomId/join', validateAccount,
    require('./joinRoomById.js'));
  app.post('/rooms', require('./post.js'));
  app.get('/rooms', require('./getAllRooms.js'));
}