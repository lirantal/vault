'use strict';

var fs = require('fs');
var clamav = require('clamav.js');
var request = require('request');
var Q = require('q');

var clamavScanner = clamav.createScanner(3310, '127.0.0.1');

// var url = 'http://www1.theladbible.com/images/content/56714fafddeb2.JPG';
// var api = 'http://api.server.com/fileScan';
// var fileId = 'asdkajh978123da';

// var vault = {
//   // The URL to download a file from
//   url: url,
//   // An API end-point to ping when the file has been scanned, or if there was an error
//   api: api,
//   // Assign a local file id
//   id: fileId
// };


function vaultRun(vault) {

  var runSuccess = false;

  download(vault)
    .then(function(data) {
      scanFile(data);
      runSuccess = true;
    })
    .catch(function(err) {
      console.log(err);
    });

  return runSuccess;
}

/**
 * given a url, create a request-compatible object (request - the npm library)
 * @param  {string} url url of a file to download
 * @return {object}     returns a promise object
 */
function composeRequestObject(url) {

  var obj = {};

  obj.method = 'GET';
  obj.uri = url;
  obj.headers = {
    'User-Agent': 'anti-virus-scan'
  };

  return obj;

}


/**
 * download file
 * @param  {object} vault vault data object
 * @return {object}       returns a promise object
 */
function download(vault) {
  var deferred = Q.defer();

  vault.local = {};

  // @TODO check if the path exists and if it is accessible
  // @TODO make this path for local download configurable
  // @TODO save the downloaded file using a generated random hash
  var localFile = '/tmp/file.jpg';
  var file = fs.createWriteStream(localFile);

  var requestUrl = composeRequestObject(vault.url);

  vault.local.tmpFile = localFile;

  console.log('-> download: starting to download');
  request.get(requestUrl)
    .on('error', function(err) {
      console.log('-> download: request error:');
      vault.local.status = 'err';
      vault.local.msg = err;
      deferred.reject(vault);
    })
    .pipe(file);

  file.on('error', function(err) {
    console.log('-> download: file on error');
    vault.local.status = 'err';
    vault.local.msg = err;
    deferred.reject(vault);
  });

  file.on('finish', function() {
    file.close(function() {
      console.log('-> download: file closed:');
      vault.local.status = 'ok';
      deferred.resolve(vault);
    });
  });

  return deferred.promise;
}

/**
 * scan a file for possible virus / malware issue
 * @param  {object} vault   a vault object
 * @return {object}         returns a promise object
 */
function scanFile(vault) {

  var deferred = Q.defer();

  // @TODO update all of console.log childish things with the debug package
  console.log('-> scanFile');
  console.log(vault);

  clamavScanner.scan(vault.local.tmpFile, function(err, object, malicious) {
    if (err) {
      console.log('scanner error');
      vault.local.status = 'err';
      vault.local.msg = err;
      deferred.reject(vault);
    } else if (malicious) {
      console.log('scanner alert');
      vault.local.status = 'alert';
      vault.local.msg = malicious;
      deferred.resolve(vault);
    } else {
      console.log('scanner safe');
      vault.local.status = 'ok';
      deferred.resolve(vault);
    }
  });

  return deferred.promise;
}


module.exports = vaultRun;
