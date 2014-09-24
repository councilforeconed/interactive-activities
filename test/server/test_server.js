// @file Test the top server.

'use strict';

// Third party libs.
var assert = require('chai').assert;
var request = require('request');
var socketio_client = require('socket.io-client');
var whenNode = require('when/node/function');

// Locally defined libs.
var createTop = require('../../src/server/createtop').createTop;

// Test the top server.
suite('top server', function() {
  var server = null;

  // Setup the server to test against.
  suiteSetup(function(done) {
    server = createTop({ pidfile: 'test/.child-pids' })
      .then(function(_server) {
        server = _server;
        // In case we are shutting down due to an error, make sure the servers
        // are closed.
        process.on('uncaughtException', function() {
          _server.close(function(e) {
            if (e && e.message !== 'Not running') {
              console.error('error while closing server', e.stack || e);
            }
          });
        });
      })
      .then(done, done);
  });

  // Tear that server down so we have a clean one for the next test.
  suiteTeardown(function(done) {
    if (server) {
      server.close(function(e) {
        if (e && e.message !== 'Not running') {
          console.error('error while closing server', e.stack || e);
          done();
        } else {
          done(e);
        }
      });
    } else {
      done();
    }
    server = null;
  });

  test('server has a port', function() {
    assert.operator(
      server.address().port, '>', 0,
      'server has a positive port'
    );
  });

  test('/status is ok', function(done) {
    var host = 'localhost:' + server.address().port;
    whenNode
      .call(request, 'http://' + host + '/status')
      .then(function(values) {
        var response = values[0];
        assert.equal(response.statusCode, 200, 'return 200 code');
        assert.equal(response.body, 'ok', 'return ok in body');
      })
      .always(done);
  });

  test('/activities/example/status is ok', function(done) {
    var host = 'localhost:' + server.address().port;
    whenNode
      .call(request, 'http://' + host + '/activities/example/status')
      .then(function(values) {
        var response = values[0];
        assert.equal(response.statusCode, 200, 'return 200 code');
        assert.equal(response.body, 'ok', 'return ok in body');
      })
      .always(done);
  });

  test('websocket to example connects', function(done) {
    var host = 'localhost:' + server.address().port;
    var didConnect = false;

    var client = socketio_client
      .connect('http://' + host, {
        resource: 'activities/example/socket.io'
      })
      .on('connect', function() {
        didConnect = true;
        client.disconnect();
      })
      .on('disconnect', function() {
        assert.ok(didConnect, 'connected');
        done();
      })
      .on('error', done);
  });
});
