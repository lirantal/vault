'use strict';

var fs = require('fs');
var crypto = require('crypto');
var clamav = require('clamav.js');
var request = require('request');
var Q = require('q');
var debug = require('debug')('vault');

/**
 * vault configuration parameter for a writable temporary directory
 * @type {String}
 */
var tmpDirectory = "c:\Temp";

var clamavScanner = clamav.createScanner(3310, '127.0.0.1');

/**
 * process data payload for scanning
 * @param  {object} vaultData
 * @return {object} an updated vaultData object with scanning information and result/status details
 */
function vaultRun(vaultData) {

  var runSuccess = false;

  download(vaultData)
    .then(function(vaultData) {
      scanFile(vaultData);
      runSuccess = true;
    })
    .catch(function(err) {
      console.log(err);
    });

  return runSuccess;
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
  var localFile = tmpDirectory + getRandomString();
  debug('downloader: temporary directory set to: %s', tmpDirectory);
  if (isPathWritable(tmpDirectory) !== true) {
    deferred.reject(new Error('"unable to write to directory'));
  }

  var file = fs.createWriteStream(localFile);

  var requestUrl = getRequestObject(vault.url);

  vault.local.tmpFile = localFile;

  debug('downloader: starting to download: %s', vault.url);
  request.get(requestUrl)
    .on('error', function(err) {
      debug('downloader: request error for file %s', vault.url);
      debug(err);
      vault.local.status = 'err';
      vault.local.msg = err;
      deferred.reject(vault);
    })
    .pipe(file);

  file.on('error', function(err) {
    debug('downloader: unable to process file: %s', vault.url);
    debug(err);
    vault.local.status = 'err';
    vault.local.msg = err;
    deferred.reject(vault);
  });

  file.on('finish', function() {
    file.close(function() {
      debug('downloader: successfully downloaded file: %s', vault.url);
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


/**
 * checks if a given path is writable
 * @param  {string}  directory path to check if writable or not by the running nodejs process
 * @return {Boolean}           [description]
 */
function isPathWritable(directory) {

  var success = true;

  try {
    fs.accessSync(directory, fs.W_OK);
  } catch (err) {
    success = false;
  }

  return success;
}

/**
 * creates a random string that can be used to save the file in the temporary directory
 * @return {string} randomly generated string
 */
function getRandomString() {
  // @TODO upadte this method to asynchronous random string generation which
  // also requires to update the flow in the calling method
  return crypto.randomBytes(48).toString('hex');
}

/**
 * given a url, create a request-compatible object (request - the npm library)
 * @param  {string} url url of a file to download
 * @return {object}     returns a promise object
 */
function getRequestObject(url) {

  var obj = {};

  obj.method = 'GET';
  obj.uri = url;
  obj.headers = {
    'User-Agent': 'anti-virus-scan'
  };

  return obj;
}

module.exports = vaultRun;
