'use strict';
var validateAccount = require('../auth/validateAccount.js');

module.exports = users;

function users(app) {
  app.post('/rooms/:roomId/join', validateAccount,
    require('./joinRoomById.js'));
  app.post('/rooms', validateAccount, require('./post.js'));
  app.get('/rooms', validateAccount, require('./getAllRooms.js'));
  app.get('/rooms/:roomName', validateAccount, require('./getRoomByName.js'));
}