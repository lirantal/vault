'use strict';

/**
 * Vault routes
 * @param app
 */
module.exports = function(app) {
  var vault = require('../../vault/controller');

  app.route('/vault').post(vault.saveVaultDate);


};