'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Vault Schema
 */
var VaultSchema = new Schema({
  url: {
    type: String,
    default: '',
    trim: true,
    required: 'URL cannot be blank'
  },
  api: {
    type: String,
    default: '',
    trim: true,
    required: 'API cannot be blank'
  },
  id: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    default: '',
    trim: true
  },
  scanStatus: {
    type: Boolean,
    trim: true,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Vault', VaultSchema);
