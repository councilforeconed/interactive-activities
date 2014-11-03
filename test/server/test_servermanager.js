// @file Test ServerManager.

'use strict';

// Third party libs.
var _ = require('lodash');
var assert = require('chai').assert;
var whenDelay = require('when/delay');

// Locally defined libs.
var ServerManager = require('../../src/server/servermanager');

// Mock ups
var getActivities = require('./mock/mock_getactivities');

suite('ServerManager', function() {
  var scripts = [];
  var manager = null;
  setup(function(done) {
    getActivities()
      .then(function(activities) {
        scripts = _.pluck(activities, 'serverIndex');
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

  suite('#launch', function() {
    test('`childrenChange` event emitted', function() {
      var args = [];
      var launchPromise;

      manager.addListener('childrenChange', function() {
        args.push(arguments);
      });

      launchPromise = manager.launch('example', examplePath());

      launchPromise.then(function() {
        assert.equal(args.length, 1);
        assert.equal(args[0].length, 1);
      });

      assert.typeOf(launchPromise.then, 'function');

      return launchPromise;
    });

    test('error-free operation with a valid path', function() {
      var launchPromise = manager.launch('example', examplePath());
      assert.typeOf(launchPromise.then, 'function');

      return launchPromise;
    });
  });

  suite('#kill', function() {
    test('`childrenChange` event emitted', function() {
      var args = [];
      var killPromise = manager.launch('example', examplePath())
        .then(function() {
          manager.on('childrenChange', function(pids) {
            args.push(pids);
          });

          return manager.kill('example');
        }).then(function() {
          assert.equal(args.length, 1);
          assert.equal(args[0].length, 0);
        });

      assert.typeOf(killPromise.then, 'function');

      return killPromise;
    });

    test('error-free operation with a running process', function() {
      var killPromise = manager.launch('example', examplePath())
        // Don't want to pass any extra arguments to manager.kill
        .yield(undefined)
        .then(manager.kill.bind(manager, 'example'));

      assert.typeOf(killPromise.then, 'function');

      return killPromise;
    });
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
