var path = require('path');
var http = require('http');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var url = require('url');
var request = require('request');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
var encoding = {encoding: 'utf-8'};
  fs.readFile(archive.paths.siteAssets + asset, encoding, function(error, content){
    if(error){
      fs.readFile(archive.paths.archivedSites + asset, encoding, function(error, data) {
        if(error) {
          res.statusCode = 404;
          res.end('File not found');
        } else {
          callback(data);
        }
      });
    } else {
      callback(content);
    }
  });
};

exports.processGet = function(req, res) {
  var parsedUrl = url.parse(req.url);
  var asset = parsedUrl.pathname;
  if(asset === '/') {
    asset = '/index.html';
  }
  var filePath = path.join(archive.paths.archivedSites, asset);
  
  exports.serveAssets(res, asset, function(content){
    res.end(content);
  });

};

var chunker = function(req, callback) {
  var body = '';
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    callback(body);
  });
};

exports.processPost = function(req, res) {
  chunker(req, function(body) {
    var pathName = body.split('=')[1].replace('http://', '');
    var filePath = path.join(archive.paths.archivedSites, pathName);
    var asset = '/' + pathName;
    res.statusCode = 201;

    archive.isUrlArchived(filePath, function(isInArchive){
      if(isInArchive === true){
        var statusCode = 302;
        res.writeHead(statusCode, {Location: asset});
        exports.serveAssets(res, asset, function(content){
          res.end(content);
        })
      } else {
        res.writeHead(302, {Location: '/loading.html'});
        archive.isUrlInList(pathName, function(isInList){
          if(isInList){
            exports.serveAssets(res, '/loading.html', function(content) {
              res.end(content);
            });
          } else {
            //add to list
            archive.addUrlToList(pathName, function(done) {
              exports.serveAssets(res, '/loading.html', function(content) {
                res.end(content);
              });
            });
          }
        });
      }
    });
  });
};

exports.downloadUrl = function(urlToDownload, callback) {
  var parsedUrl = url.parse(urlToDownload);
  var options = {
    host: parsedUrl.pathname,
    path: '/',
    method: 'GET',
    headers: exports.headers
  };
  
  http.request(options, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      callback(body);
    });
  }).on('error', function(e){
    console.log('error: ', e);
  }).end();
};




// As you progress, keep thinking about what helper functions you can put here!
