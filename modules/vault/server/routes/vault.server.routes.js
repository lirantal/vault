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
};
