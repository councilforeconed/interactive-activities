// @file Test ServerManager.

'use strict';

// Third party libs.
var _ = require('lodash');
var assert = require('chai').assert;
var whenDelay = require('when/delay');

// Locally defined libs.
var findServerScripts = require(
  '../../src/server/findserverscripts'
).findServerScripts;
var ServerManager = require('../../src/server/servermanager');

suite('ServerManager', function() {
  var scripts = [];
  var manager = null;
  setup(function(done) {
    findServerScripts()
      .then(function(_scripts) {
        scripts = _scripts;
        manager = new ServerManager();
      })
      .always(done);
  });
  teardown(function(done) {
    // In resolve state, don't pass arguments to done, that'll cause an error.
    manager.killAll().yield(undefined).always(done);
  });

  var examplePath = function() {
    return _.find(scripts, function(script) {
      return script.indexOf('example') !== -1;
    });
  };

  test('launch example', function(done) {
    manager.launch('example', examplePath())
      // In resolve state, don't pass arguments to done, that'll cause an error.
      .yield(undefined)
      .always(done);
  });

  test('kill example', function(done) {
    manager.launch('example', examplePath())
      // Don't want to pass any extra arguments to manager.kill
      .yield(undefined)
      .then(manager.kill.bind(manager, 'example'))
      // In resolve state, don't pass arguments to done, that'll cause an error.
      .yield(undefined)
      .always(done);
  });

  test('example is relaunched', function(done) {
    // Is it fair to assume on all systems that pid and port will be different
    // for every process?
    var pid, port;
    manager.launch('example', examplePath())
      .then(function() {
        var child = manager._children.example;
        pid = child.process.pid;
        port = child.port;
        // Kill the process directly. ServerChild should then relaunch.
        child.process.kill();
        // Wait 50 milliseconds for the new wrapper and launched promise.
        return whenDelay(undefined, 50);
      })
      .then(function() {
        var child = manager._children.example;
        assert.isDefined(child, 'A server child exists');
        return child.whenLaunched;
      })
      .then(function() {
        var child = manager._children.example;
        assert.operator(child.port, '>', 0, 'Child has a positive port.');
        assert.notEqual(pid, child.process.pid, 'New child has different pid.');
        assert.notEqual(port, child.port, 'New child has a different port.');
      })
      .always(done);
  });
});
