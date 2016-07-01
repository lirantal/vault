'use strict';

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
var path = require('path');
var debug = require('debug')('vault');
var vault = require(path.resolve('./config/lib/vault'));

/**
 * vault scan interval, will be scanning for a file every interval
 * @type {Number}
 */
var scanInterval = 10000;


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
      vault(vaultData, function(err, data) {
        // @TODO on error we want to return the file we took for scanning to
        // the files-to-scan queue so we can take it again later
        // if (err) {
        //
        // }
        // @TODO
        // if the scanning completed, we will update the files queue with These
        // details and ping back the API with the result

        // finally, when the vault scanning flow is completed, we re-schedule
        // this process again in the loop
        maintainVault();
      });
    }, scanInterval);
  }

  // initialize the forever-loop
  maintainVault();
});
