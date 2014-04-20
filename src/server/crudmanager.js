'use strict';

var ListenTo = require('./listento');

// Export CRUDManager
module.exports = CRUDManager;

// Wrap a store with a CRUD interface.
//
// CRUDManager provides a simple promise interface for performing CRUD
// operations of the generic store backend. It also emits events when
// the operations are complete.
//
// TODO: Add options param to create, update, and delete, to allow
// replication triggering those functions with a silent option that will
// not emit an event. This could be use to let a cluster of CRUDManagers
// to replicate any info added to any of them, becoming eventually
// consistant.
//
// @params options
//    - {string} name
//    - {Store} store backend to store information
// @constructor
function CRUDManager(options) {
  ListenTo.call(this, ['create', 'update', 'delete']);
  this.name = options.name;
  this._store = options.store;
}

// @inherits {ListenTo}
CRUDManager.prototype = Object.create(ListenTo.prototype);
CRUDManager.prototype.constructor = CRUDManager;

// Create an object.
// @returns {Promise} rejects if name is already in use.
CRUDManager.prototype.create = function(name, value) {
  var self = this;
  return self._store.hasKey(name)
    .then(function(hasKey) {
      if (hasKey) {
        throw new Error('Cannot create ' + name + '. Update it instead.');
      }
      return self._store.set(name, value);
    })
    .then(function() {
      self.emit('create', name, value);
      return value;
    });
};

// Read an object.
// @returns {Promise}
CRUDManager.prototype.read = function(name) {
  return this._store.get(name);
};

// Update an object.
// @returns {Promise} rejects if the object does not exist.
CRUDManager.prototype.update = function(name, value) {
  var self = this;
  return self._store.hasKey(name)
    .then(function(hasKey) {
      if (!hasKey) {
        throw new Error('Cannot update ' + name + '. Create it first.');
      }
      return self._store.set(name, value);
    })
    .then(function() {
      self.emit('update', name, value);
      return value;
    });
};

// Delete an object.
// @returns {Promise}
CRUDManager.prototype.delete = function(name) {
  var self = this;
  return self._store.delete(name)
    .then(function(value) {
      self.emit('delete', name);
      return value;
    });
};

// Return an object that can be consumed by express-resource to provide
// a RESTful CRUD interface.
CRUDManager.prototype.resource = function() {
  var self = this;
  var id = self.name;

  return {
    id: id,

    load: function(id, fn) {
      self.read(id)
        .then(function(value) { fn(undefined, value); }, fn);
    },

    create: function(req, res, next) {
      self.create(req.body.id, req.body)
        .then(res.json.bind(res), next);
    },

    show: function(req, res) {
      res.json(req[id]);
    },

    update: function(req, res, next) {
      self.update(req[id], req.body)
        .then(res.json.bind(res), next);
    },

    destroy: function(req, res, next) {
      self.delete(req[id])
        .then(function() {
          res.send(200);
        })
        .catch(next);
    }
  };
};
