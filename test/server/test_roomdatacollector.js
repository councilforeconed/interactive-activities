'use strict';

// Third party libs
var assert = require('chai').assert;
var through2spy = require('through2-spy');
var when = require('when');

// Locally defined libs
var CRUDManager = require('../../src/server/crudmanager');
var RoomDataCollector = require('../../src/server/roomdatacollector');
var MemoryStore = require('../../src/server/storememory');

// Create promise for the number of objects in a stream.
var countDataInStream = function(stream) {
  return when.promise(function(resolve, reject) {
    var count = 0;
    stream
      .on('end', function() {
        // FIXME: this end should be part of the spy or after but the end event
        // doesn't seem to be correctly piping for yet unknown reasons.
        // mzgoddard suspects through2spy currently.
        resolve(count);
      })
      .pipe(through2spy({ objectMode: true }, function() {
        count++;
      }))
      .on('error', reject);
  });
};

var setupData = function(collector) {
  return when
    .map([
      ['my-room', { data: 'data' }],
      ['my-room', { data: 'other-data' }]
    ], collector.add.apply.bind(collector.add, collector));
};

suite('RoomDataCollector', function() {
  var collector = null;
  setup(function() {
    collector = new RoomDataCollector(new CRUDManager({
      name: 'test',
      store: new MemoryStore()
    }));
  });

  test('#add', function(done) {
    collector
      .add('my-room', { data: 'data' })
      .then(function(data) {
        assert.isObject(data, 'collector returns given data after stored');
      })
      .always(done);
  });

  test('#getStream', function(done) {
    setupData(collector)
      .then(collector.getStream.bind(collector, 'my-room'))
      .then(countDataInStream)
      .then(function(numData) {
        assert.equal(numData, 2, 'there are two records');
      })
      .always(done);
  });

  test('#delete', function(done) {
    setupData(collector)
      .then(collector.delete.bind(collector, 'my-room'))
      .then(collector.getStream.bind(collector, 'my-room'))
      .then(countDataInStream)
      .then(function(numData) {
        assert.equal(numData, 0, 'all records were deleted');
      })
      .always(done);
  });
});
