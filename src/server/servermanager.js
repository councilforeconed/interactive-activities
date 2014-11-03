// @file Manage a group of servers with ServerManager.

'use strict';

// Node included libs.
var child_process = require('child_process');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

// Third party libs.
var _ = require('lodash');
var debug = require('debug')('cee:childmanager');
var http_proxy = require('http-proxy');
var when = require('when');

// Export the ServerManager constructor.
module.exports = ServerManager;

// Wrap a sub server process for easier communicataion.
function ServerChild(name, indexFile) {
  var self = this;

  this.name = name;
  this.path = indexFile;

  this.port = 0;
  this.proxy = null;
  this.process = child_process.fork(indexFile, {
    cwd: path.dirname(indexFile)
  });

  this.whenLaunched =
    this._whenMessage(function(data) {
      return typeof data === 'object' && data.name === 'listening-on';
    })
    .then(function(data) {
      debug('%s - received port server is listening on %d', name, data.port);
      self._setPort(data.port);
    });
}

// Set the port and create an object to proxy traffic with.
ServerChild.prototype._setPort = function(port) {
  this.port = port;
  this.proxy = http_proxy.createProxyServer({
    target: {
      host: 'localhost',
      port: port
    }
  });
};

// Create a promise to resolve when the child sends a message fitting a given
// test function.
ServerChild.prototype._whenMessage = function(test) {
  var self = this;
  return when.promise(function(resolve, reject) {
    self.process.on('message', function receive(data) {
      if (test(data)) {
        try {
          self.process.removeListener('message', receive);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      }
    });
  });
};

// Kill the child.
ServerChild.prototype.kill = function(signal) {
  var self = this;
  return when.promise(function(resolve) {
    debug('kill %s', self.name);
    var process = self.process;
    process.on('exit', function() {
      debug('stopped %s (pid %d)', self.name, process.pid);
      resolve();
    });
    process.kill(signal);
  });
};

// Manage sub servers. Launch, auto-relaunch on exit, kill, send messages, and
// proxy web traffic to them by a given name. Implements the Node.js
// `EventEmitter` API, and emits the following events:
//
// - "childrenChange": when a child process is created or destroyed, this even
//   is emitted with an array of all active process identifiers
function ServerManager() {
  EventEmitter.call(this);

  this._children = {};
}

ServerManager.prototype = Object.create(EventEmitter.prototype);

// Retrieve an array of process identifiers for all child processes
//
// @returns {Array} identifiers for active child processes
ServerManager.prototype.pids = function() {
  return _.map(this._children, function(child) {
    return child.process.pid;
  });
};

// Launch a sub server at path with a name.
// @param name
// @param path
// @returns {Promise}
ServerManager.prototype.launch = function(name, path) {
  debug('%s - launch', name);

  var child = this._children[name] = new ServerChild(name, path);

  // Have a bound version stored that can be easily removed as a listener.
  child._relaunch = this.launch.bind(this, name, path);

  // On exit, relaunch this child.
  child.process.on('exit', child._relaunch);

  this.emit('childrenChange', this.pids());

  return child.whenLaunched;
};

// Kill a sub server with a given name.
// @param name
// @param signal optional. Send a kill signal of the given type. eg. 'SIGINT'
// @returns {Promise} promise that resolves when the server has exited.
ServerManager.prototype.kill = function(name, signal) {
  var child = this._children[name];
  var promise;

  if (child === undefined) {
    return when.resolve();
  } else {
    child.process.removeListener('exit', child._relaunch);
    promise = child.kill(signal);

    delete this._children[name];

    this.emit('childrenChange', this.pids());

    return promise;
  }
};

// Kill all subservers
// @param signal optional
// @returns {Promise} promise that resolves when all sub servers have exited.
ServerManager.prototype.killAll = function(signal) {
  var self = this;
  return when.map(_.pairs(self._children), function(pair) {
    var name = pair[0];
    var child = pair[1];
    return child ? self.kill(name, signal) : when.resolve();
  });
};

// Send a sub server a message.
//
// In the sub server, the message is received with
// `process.on('message', function(data) {})`.
// @param name
// @param {array} args
ServerManager.prototype.send = function(name, args) {
  var child = this._children[name].process;
  child.send.apply(child, args);
};

// Proxy web traffic to a sub server.
ServerManager.prototype.proxyWeb = function(name, args) {
  var child = this._children[name];
  if (!child) {
    throw new Error('Cannot proxy web traffic to ' + name + '.');
  }
  child.whenLaunched.then(function() {
    child.proxy.web.apply(child.proxy, args);
  });
};

// Proxy a web socket to a sub server.
ServerManager.prototype.proxyWs = function(name, args) {
  var child = this._children[name];
  if (!child) {
    throw new Error('Cannot proxy web socket connection to ' + name + '.');
  }
  child.whenLaunched.then(function() {
    child.proxy.ws.apply(child.proxy, args);
  });
};
