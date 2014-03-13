'use strict';

var EventEmitter = require('events').EventEmitter;

module.exports = ReplicatorTarget;

function ReplicatorTarget() {};

ReplicatorTarget.prototype = Object.create(EventEmitter.prototype);
ReplicatorTarget.prototype.constructor = ReplicatorTarget;

ReplicatorTarget.prototype.send = function(data) {
  this.emit('message', data);
};
