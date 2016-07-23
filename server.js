'use strict';

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
var path = require('path');
var config = require(path.resolve('./config/config'));
var debug = require('debug')('vault');
var vault = require(path.resolve('./config/lib/vault'));
var request = require('request');
var _ = require('lodash');

/**
 * Model initialization
 */
var mongoose = require('mongoose'),
  Vault = mongoose.model('Vault');

/**
 * vault scan interval, will be scanning for a file every interval
 * @type {Number}
 */
var scanInterval = config.vault.scanInterval;

var server = app.start(function(app, db, config) {

  function maintainVault() {
    setTimeout(function() {

      Vault.findOneAndUpdate({ scanStatus: false }, { scanStatus: true }, function (err, document) {

        if (!document) {
          debug('vault: did not find any vault data document to process');
          return maintainVault();
        }

        if (err) {
          // on error, we log it and get back to the wait on fetching another item from the queue
          debug('vault: error fetching and updating document from vaults');
          return maintainVault();
        }

        debug('vault: %s - processing document: %s', new Date().toJSON(), document._id);

        var vaultDocument = {
          url: document.url,
          api: document.api,
          id: document.id,
          status: document.status,
          scanStatus: document.scanStatus
        };

        vault(vaultDocument, function(err, vaultData) {

          // on error we want to return the file we took for scanning to
          // the files-to-scan queue so we can take it again later
          if (err) {
            debug('vault: error processing document: %s with error %s: ', document._id, err);
            Vault.findOneAndUpdate({ scanStatus: false }, { _id: document._id });
            return maintainVault();
          } else {
            // if the scanning completed, we will update the files queue with These
            // details and ping back the API with the result
            request({
              method: 'POST',
              uri: document.api,
              json: {
                url: document.url,
                api: document.api,
                status: vaultData.local.status,
                msg: vaultData.local.msg
              }
            },
              function(err, httpIncoming, response) {
                if (err) {
                  // on error, we log it and get back to the wait on fetching another item from the queue
                  debug('vault: unable to ping back server api for %s: %s', document._id, err.message);
                  Vault.findOneAndUpdate({ scanStatus: false }, { _id: document._id });
                  return maintainVault();
                } else {
                  debug('vault: successfully pinged api server %s and processed %s', document.api, document._id);
                  return maintainVault();
                }
              });
          }
        });

      });
    }, scanInterval);
  }

  // initialize the forever-loop
  maintainVault();
});
