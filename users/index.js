'use strict';

module.exports = index;

function index(req, res) {
  res.render('index', { title: "Let's start with the quiz"});
}