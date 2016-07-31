'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs');
var crypto = require('crypto');
var config = require('../config');
var clamav = require('clamav.js');
var request = require('request');
var Q = require('q');
var debug = require('debug')('vault');

/**
 * vault configuration parameter for a writable temporary directory
 * @type {String}
 */
var tmpDirectory = config.vault.incomingDirectory;

var clamavScanner = clamav.createScanner(config.vault.scanner.port, config.vault.scanner.host);

/**
 * process data payload for scanning
 * @param  {object} vaultData
 * @return {object} an updated vaultData object with scanning information and result/status details
 */
function vaultRun(vaultData, callback) {

  var runSuccess = false;

  download(vaultData)
    .then(function(data) {
      return scanFile(data);
    })
    .then(function(data) {
      return removeFile(data);
    })
    .then(function(data) {
      return callback(null, data);
    })
    .catch(function(data) {
        debug('vault: error completing flow: ' + data.local.msg);
        return callback(data.local.msg, vaultData);
    });
}

/**
 * download file
 * @param  {object} vault vault data object
 * @return {object}       returns a promise object
 */
function download(vault) {
  var deferred = Q.defer();

  vault.local = {};

  debug('downloader: initialized');

  // @TODO check if the path exists and if it is accessible
  // @TODO make this path for local download configurable
  // @TODO save the downloaded file using a generated random hash
  var localFile = tmpDirectory + getRandomString();
  debug('downloader: temporary directory set to: %s', tmpDirectory);
  if (isPathWritable(tmpDirectory) !== true) {
    vault.local.status = 'err';
    vault.local.msg = 'unable to write to directory';
    deferred.reject(vault);
    return deferred.promise;
  }

  var file = fs.createWriteStream(localFile);

  var requestUrl = getRequestObject(vault.url);

  vault.local.tmpFile = localFile;
  vault.localFile = localFile;

  debug('downloader: starting to download: %s', vault.url);

  try {
    request.get(requestUrl)
    .pipe(file);
  } catch (err) {
    debug('downloader: request error for file %s', vault.url);
    vault.local.status = 'err';
    vault.local.msg = err;
    deferred.reject(vault);
    return deferred.promise;
  }

  file.on('error', function(err) {
    debug('downloader: unable to process file: %s', vault.url);
    vault.local.status = 'err';
    vault.local.msg = err;
    deferred.reject(vault);
    return deferred.promise;
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

  debug('scanner: initialized');

  // initialize empty msg variable
  vault.local.msg = '';

  clamavScanner.scan(vault.local.tmpFile, function(err, object, malicious) {
    debug('scanner: scanning file: %s', vault.local.tmpFile);
    if (err) {
      debug('scanner: error scanning file');
      vault.local.status = 'err';
      vault.local.msg = err;

      removeFile(vault).then(function(data) {
          return deferred.reject(vault);
      }).catch(function(data) {
        return deferred.reject(vault);
      });

    } else if (malicious) {
      debug('scanner: found malicious file');
      vault.local.status = 'alert';
      vault.local.msg = malicious;
      deferred.resolve(vault);
    } else {
      debug('scanner: safe file');
      vault.local.status = 'ok';
      deferred.resolve(vault);
    }
  });

  return deferred.promise;
}

/**
 * remove a file
 * @param  {string} file given a filename or path the file will be removed
 * @return {boolean}      true/false on success/failure
 */
function removeFile(vaultData) {

  var deferred = Q.defer();
  var file = vaultData.local.tmpFile;

  debug('removeFile: attempting to remove file: %s', file);

  if (!file) {
    vaultData.local.status = 'err';
    vaultData.local.msg = 'no file path was provided';
    deferred.reject(vaultData);
    return deferred.promise;
  }

  fs.unlink(file, function(err) {
    if (err) {
      vaultData.local.status = 'err';
      vaultData.local.msg = 'error deleting file';
      deferred.reject(vaultData);
      return deferred.promise;
    }
    deferred.resolve(vaultData);
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
