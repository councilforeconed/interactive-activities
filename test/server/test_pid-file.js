'use strict';
var fs = require('fs');

var when = require('when');
var whenNode = require('when/node/function');
var assert = require('chai').assert;

var pidFile = require('../../src/server/pid-file');

var writeFile = whenNode.lift(fs.writeFile);
var readFile = whenNode.lift(fs.readFile);
var unlink = whenNode.lift(fs.unlink);

suite('pidFile', function() {
  suite('read', function() {
    setup(function() {
      return when.all([
        writeFile('.test-pids-good', '1,2,3'),
        writeFile('.test-pids-bad', '1,a,3'),
        writeFile('.test-pids-empty', '')
      ]);
    });
    teardown(function() {
      return when.all([
        unlink('.test-pids-good'),
        unlink('.test-pids-bad'),
        unlink('.test-pids-empty')
      ]);
    });
    test('reads file from disk', function(done) {
      pidFile.read('.test-pids-good').then(function(pids) {
        assert.equal(pids.length, 3);
        assert.equal(pids[0], 1);
        assert.equal(pids[1], 2);
        assert.equal(pids[2], 3);
        done();
      });
    });
    test('bad data', function(done) {
      pidFile.read('.test-pids-bad').then(function(pids) {
        assert.equal(pids.length, 2);
        assert.equal(pids[0], 1);
        assert.equal(pids[1], 3);
        done();
      });
    });
    test('empty files', function(done) {
      pidFile.read('.test-pids-empty').then(function(pids) {
        assert.equal(pids.length, 0);
        done();
      });
    });
  });

  suite('write', function() {
    test('correctly writes data', function() {
      return pidFile.write('.test-pids', [4, 5, 6])
        .then(function() {
          return readFile('.test-pids');
        }).then(function(content) {
          return unlink('.test-pids')
            .then(function() {
              assert.equal(content, '4,5,6');
            });
        });
    });
  });
});
