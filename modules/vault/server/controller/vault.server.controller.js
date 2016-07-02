'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  Vault = mongoose.model('Vault'),
  logger = require(path.resolve('./config/lib/logger')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

exports.saveVaultDate = function(req, res, next) {

  var vaultEntry = new Vault({
    url: req.body.url,
    api: req.body.api,
    id: req.body.id
  });

  vaultEntry.save(function(err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(201).send(vaultEntry);
    }
  });

};

exports.getVaultObject = function(req, res, next) {
  // var cpId = req.param('cpId'),
  //   errMsg = '';
  //
  // var query = Vault.find({'cpId': cpId});
  // query.exec(function (err, data) {
  //  if (err) {
  //    errMsg = 'Could not retrieve vault information for the requested content package due to ' + err;
  //    logger.info(errMsg);
  //    res.statusCode = 500;
  //    res.body = {message: errMsg};
  //    return next();
  //  }
  //  else if (data.length === 0) {
  //    errMsg = 'Error : Failed to find any vault info for teh content packagee ' + cp;
  //    logger.info(errMsg);
  //    res.statusCode = 404;
  //    res.body = {message: errMsg};
  //    return next();
  //  }
  //  res.statusCode = Config.StatusCode.OK;
  //  res.body = data;
  //  return next();
  // });
};
