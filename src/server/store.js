'use strict';

// Third party libs.
var when = require('when');

module.exports = Store;

// A high level key, value store abstraction.
// @constructor
function Store() {}

// Does the store contain a key.
// @param {string} key
// @returns {Promise}
// @abstract
Store.prototype.hasKey = function() {
  return when.reject(new Error('Store#hasKey not implemented'));
};

// Get the value stored at key.
// @param {string} key
// @returns {Promise}
// @abstract
Store.prototype.get = function() {
  return when.reject(new Error('Store#get not implemented'));
};

// Set the value stored at key.
// @param {string} key
// @param {object} value
// @returns {Promise}
// @abstract
Store.prototype.set = function() {
  return when.reject(new Error('Store#set not implemented'));
};

// Delete a key from the store.
// @param {string} key
// @returns {Promise}
// @abstract
Store.prototype.delete = function() {
  return when.reject(new Error('Store#delete not implemented'));
};
