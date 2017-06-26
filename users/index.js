'use strict';

module.exports = index;

function index(req, res) {
  var path = require('path')
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
}