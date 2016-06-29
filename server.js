'use strict';

var path = require('path');

var debug = require('debug')('vault');
var vault = require(path.resolve('./config/lib/vault'));

/**
 * vault scan interval, will be scanning for a file every interval
 * @type {Number}
 */
var scanInterval = 10000;

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
var server = app.start(function(app, db, config) {

  var vaultData = {
    // The URL to download a file from
    url: 'http://www1.theladbible.com/images/content/56714fafddeb2.JPG',
    // An API end-point to ping when the file has been scanned, or if there was an error
    api: 'http://api.server.com/fileScan',
    // Assign a local file id
    id: 'asdkajh978123da'
  };

  function maintainVault() {
    setTimeout(function() {
      debug('vault: processing vaultData - %s', new Date().toJSON());
      vault(vaultData, function() {
        maintainVault();
      });
    }, scanInterval);
  }

  maintainVault();
});
