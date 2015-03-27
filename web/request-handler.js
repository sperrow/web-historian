var path = require('path');
var archive = require('../helpers/archive-helpers');
var utils = require('./http-helpers.js');

var actions = {
  'GET': function(req, res){
    utils.processGet(req, res);
  },
  'POST': function(req, res){
    utils.processPost(req, res);
  }
}

exports.handleRequest = function (req, res) {
  actions[req.method](req, res);
};
