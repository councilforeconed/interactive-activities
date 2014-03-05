// @file Manage a group of servers with ServerManager.

'use strict';

// Node included libs.
var child_process = require('child_process');
var path = require('path');

// Third party libs.
var _ = require('lodash');
var debug = require('debug')('cee:childmanager');
var http_proxy = require('http-proxy');
var when = require('when');

// Export the ServerManager constructor.
module.exports = ServerManager;

// Wrap a sub server process for easier communicataion.
function ServerChild(manager, name, indexFile) {
  var self = this;

  this.name = name;
  this.path = indexFile;

  this.port = 0;
  this.proxy = null;
  this.process = child_process.fork(indexFile, {
    cwd: path.dirname(indexFile)
  });

  this._whenOk =
    this._whenMessage(function(data) {return data === 'ok';})
    .then(function() {debug('%s - ok (pid %d)', name, self.process.pid);});
  this._whenPort =
    this._whenMessage(function(data) {
      return typeof data === 'object' && data.name === 'listening-on';
    })
    .then(function(data) {
      debug('%s - received port server is listening on %d', name, data.port);
      self._setPort(data.port);
    });

  this.whenLaunched = when.all([this._whenOk, this._whenPort]);

  // Have a bound version stored that can be easily removed as a listener.
  this._relaunch = manager.launch.bind(manager, name, indexFile);

  // On exit, relaunch this child.
  this.process.on('exit', this._relaunch);
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
    process.removeListener('exit', self._relaunch);
    process.on('exit', function() {
      debug('stopped %s (pid %d)', self.name, process.pid);
      resolve();
    });
    process.kill(signal);
  });
};

// Manage sub servers. Launch, auto-relaunch on exit, kill, send messages, and
// proxy web traffic to them by a given name.
function ServerManager() {
  this._children = {};
}

// Launch a sub server at path with a name.
// @param name
// @param path
// @returns {Promise}
ServerManager.prototype.launch = function(name, path) {
  debug('%s - launch', name);

  var child = this._children[name] = new ServerChild(this, name, path);

  return child.whenLaunched;
};

// Kill a sub server with a given name.
// @param name
// @param signal optional. Send a kill signal of the given type. eg. 'SIGINT'
// @returns {Promise} promise that resolves when the server has exited.
ServerManager.prototype.kill = function(name, signal) {
  var self = this;
  if (self._children[name] === undefined) {
    return when.resolve();
  } else {
    var promise = self._children[name].kill(signal);
    self._children[name] = undefined;
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
  child.whenLaunched.then(function() {
    child.proxy.web.apply(child.proxy, args);
  });
};

// Proxy a web socket to a sub server.
ServerManager.prototype.proxyWs = function(name, args) {
  var child = this._children[name];
  child.whenLaunched.then(function() {
    child.proxy.ws.apply(child.proxy, args);
  });
};
