var path = require('path');
var http = require('http');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var url = require('url');

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
  fs.readFile(asset, function(error, content){
    if(error){
      throw (error);
    }

    callback(content);
  });
};


exports.router = function(req) {
  var parsedUrl = url.parse(req.url);
  var pathName = parsedUrl.pathname.slice(1);
  // var filePath = archive.paths.archivedSites + '/' + pathName;
  return pathName;
}

exports.processGet = function(res, pathName) {
  var filePath = archive.paths.archivedSites + '/' + pathName;
  if(pathName === ''){
    //serve index
    exports.serveAssets(res, './web/public/index.html', function(content){
      res.end(content);
    });
  } else {
    archive.isUrlArchived(filePath, function(isInArchive){
      if(isInArchive === true){
        exports.serveAssets(res, filePath, function(content){
          res.statusCode = 200;
          res.end(content);
        });
      } else {
        res.statusCode = 404;
        res.end('File not found');
      }
    });
  }
};

exports.processPost = function(res, req, pathName) {
  var filePath = archive.paths.archivedSites + '/' + pathName;
  res.statusCode = 201;
  archive.isUrlArchived(filePath, function(isInArchive){
    if(isInArchive === true){
      exports.serveAssets(res, filePath, function(content){
        res.end(content);
      })
    } else {
      archive.isUrlInList(pathName, function(isInList){
        if(isInList){
          exports.serveAssets(res, './web/public/loading.html', function(content) {
            res.end(content);
          });
        } else {
          //add to list
          archive.addUrlToList(pathName, function(done) {
            exports.serveAssets(res, './web/public/loading.html', function(content) {
              res.statusCode = 302;
              res.end(content);
            });
          });
        }
      });
    }
  });
};

/*exports.router = function(req, res){
  var parsedUrl = url.parse(req.url);
  console.log("parsedURl: ", parsedUrl);
  var query = parsedUrl.pathname;
  query = query.slice(1);
  var pathName = archive.paths.archivedSites + '/' + query;
  console.log("pathName on creation: ", pathName);
  //if url /
  if(req.url === '/'){
    //serve index
    exports.serveAssets(res, './web/public/index.html', function(content){
      res.end(content);
    });
  } else {
    validateUrl(query, function(statusCode) {
      if(statusCode === '404') {
        res.statusCode = 404;
        res.end();
      } else {
        archive.isUrlArchived(pathName, function(isInArchive){
          if(isInArchive === true){
            exports.serveAssets(res, pathName, function(content){
              res.end(content);
            })
          } else {
            archive.isUrlInList(query, function(isInList){
              if(isInList){
                //send loading page
              } else {
                //add to list
              }
            });
          }
        });
      }
    });

  }
}
*/




// As you progress, keep thinking about what helper functions you can put here!
