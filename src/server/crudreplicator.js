// @file Provide CRUDReplicator and CRUDReplicator.EndPoint. These classes are
//   used to relay CRUDManager events over a form of communication. They expect
//   an object that has a send(object) function and an emitter that fires
//   message events with the given object.

'use strict';

var ProxyFromEmitter = require('./proxyfromemitter');

module.exports = CRUDReplicator;

// Listen to ActivityManager events and send messages to related server
// children to CRUD rooms and groups.
function CRUDReplicator(options) {
  this.crudManager = options.manager;
  this.type = options.type;
  this.target = options.target;

  this.crudManager.on('create', this._handler('create'));
  this.crudManager.on('update', this._handler('update'));
  this.crudManager.on('delete', this._handler('delete'));
}

CRUDReplicator.prototype._handler = function(method) {
  return function(name, value) {
    this.target.send({
      name: 'replicator-' + method,
      type: this.type,
      key: name,
      value: value
    });
  }.bind(this);
};

CRUDReplicator.EndPoint = CRUDReplicatorEndPoint;

function CRUDReplicatorEndPoint(options) {
  ProxyFromEmitter.call(this);

  this.emitter = options.emitter;
  this.type = options.type;

  this.emitter.on('message', function(data) {
    if (typeof data !== 'object') { return; }
    if (data.name === 'replicator-create' && data.type === this.type) {
      this.emit('create', data.key, data.value);
    } else if (data.name === 'replicator-update' && data.type === this.type) {
      this.emit('update', data.key, data.value);
    } else if (data.name === 'replicator-delete' && data.type === this.type) {
      this.emit('delete', data.key, data.value);
    }
  }.bind(this));
}

CRUDReplicatorEndPoint.prototype = Object.create(ProxyFromEmitter.prototype);
CRUDReplicatorEndPoint.prototype.constructor = CRUDReplicatorEndPoint;
