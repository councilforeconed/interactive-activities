'use strict';

// Third party libs.
var _ = require('lodash');
var when = require('when');

// Locally defined libs.
var Store = require('./store');

// @export MemoryStore
module.exports = MemoryStore;

// Store key, value pairs in memory.
// @constructor
function MemoryStore() {
  this._values = {};
}

// @inherits Store
MemoryStore.prototype = Object.create(Store.prototype);
MemoryStore.prototype.constructor = MemoryStore;

// Does the store contain a key.
// @param {string} key
// @returns {Promise}
MemoryStore.prototype.hasKey = function(key) {
  return when.resolve(this._values[key] !== undefined);
};

// Get the value stored at key.
// @param {string} key
// @returns {Promise}
MemoryStore.prototype.get = function(key) {
  if (this._values[key] === undefined) {
    return when.reject(new Error('Key, ' + key + ', not found.'));
  }
  return when.resolve(_.cloneDeep(this._values[key]));
};

// Set the value stored at key.
// @param {string} key
// @param {object} value
// @returns {Promise}
MemoryStore.prototype.set = function(key, value) {
  return when.resolve(this._values[key] = _.cloneDeep(value));
};

// Delete a key from the store.
// @param {string} key
// @returns {Promise}
MemoryStore.prototype.delete = function(key) {
  if (!(key in this._values)) {
    return when.reject(
      new Error('Cannot delete key. ' + key + ' is not stored.')
    );
  }
  return when.resolve(delete this._values[key]);
};
