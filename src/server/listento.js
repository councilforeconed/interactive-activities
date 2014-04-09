'use strict';

// Node core modules
var EventEmitter = require('events').EventEmitter;

// Third party modules
var _ = require('lodash');

// Locally defined modules
var ProxyFromEmitter = require('./proxyfromemitter');

// @export ListenTo
module.exports = ListenTo;

// Superclass for easily listening to a ProxyFromEmitter.
//
// ProxyFromEmitters have a special '*' event that listening to, A ListenTo
// subclass can hear proxied events off an internal emitter. This lets ListenTo
// bind all methods in the subclass to the internal emitter ahead of time. Once
// #listenTo is called on a target emitter it will have one binding to that
// emitter on the special event. This lets ListenTo subclasses easily and
// quickly connect and disconnect from their target emitters.
//
// @param listenerNames an array of names of events and local methods to bind to
//    or an object mapping events to local methods.
function ListenTo(listenerNames) {
  ProxyFromEmitter.call(this);

  this._listeningTo = null;
  this._listeningEmitter = new EventEmitter();
  this._listeningHandler = null;

  if (listenerNames) {
    _.each(ListenTo.bindNames(this, listenerNames), function(handle, event) {
      this._listeningEmitter.on(event, handle);
    }, this);
  }
}

// @inherits {ProxyFromEmitter}
ListenTo.prototype = Object.create(ProxyFromEmitter.prototype);
ListenTo.prototype.constructor = ListenTo;

// Listen to a ProxyFromEmitter.
//
// Only one target is allowed at a time. If an instance is still listening to
// another emitter, it will stop listening, and then start listening to the new
// one.
//
// @param {ProxyFromEmitter} emitter
ListenTo.prototype.listenTo = function(emitter) {
  this.stopListening();

  if (!this._listeningHandler) {
    this._listeningHandler =
      this._listeningEmitter.emit.call.bind(
        this._listeningEmitter.emit,
        this._listeningEmitter
      );
  }
  this._listeningTo = emitter;
  this._listeningTo.on('*', this._listeningHandler);
};

// Stop listening to the old emitter.
ListenTo.prototype.stopListening = function() {
  if (this._listeningTo) {
    this._listeningTo.removeListener('*', this._listeningHandler);
  }
};

// Convenience function for binding arrays of event/method names or object
// mappings of events to methods.
//
// @param ctx an object to find methods on and bind to
// @param names an array or object mapping events and methods.
ListenTo.bindNames = function(ctx, names) {
  if (Array.isArray(names)) {
    var result = {};
    _.each(names, function(value) {
      result[value] = ctx[value].bind(ctx);
    }, ctx);
    return result;
  } else {
    return _.mapValues(names, function(value) {
      return ctx[value].bind(ctx);
    }, ctx);
  }
};
