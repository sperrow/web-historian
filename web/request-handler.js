var path = require('path');
var archive = require('../helpers/archive-helpers');
var http_helpers = require('./http-helpers.js');

// require more modules/folders here!

var actions = {
  'GET': function(req, res){
    var pathName = http_helpers.router(req);
    http_helpers.processGet(res, pathName);
  },
  'POST': function(req, res){
    var pathName = http_helpers.router(req);
    http_helpers.processPost(res, pathName);
  },
  'OPTIONS': function(req, res){

  }
}

exports.handleRequest = function (req, res) {
  actions[req.method](req, res);

  //res.end(archive.paths.list);
};
