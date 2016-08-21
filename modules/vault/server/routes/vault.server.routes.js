'use strict';

/**
 * Module dependencies.
 */
var vault = require('../controller/vault.server.controller');

/**
 * Vault routes
 * @param app
 */
module.exports = function(app) {
  app.route('/api/vaultQueue').post(vault.saveVaultDate);

  // comment out for testing the ping back URL from vault
  // app.route('/api/test').all(function(req, res, next) {
  //   console.log('vault server pinged back with:');
  //   console.log(req.body);
  //   next();
  // });
};
