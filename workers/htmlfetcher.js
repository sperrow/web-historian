// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');

console.log(__dirname);
archive.readListOfUrls(function(urlArray) {
  archive.downloadUrls(urlArray);
});
