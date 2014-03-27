'use strict';

// Third party libs
var when = require('when');

// Locally defined libs
var CRUDValueStream = require('./crudvaluestream');

// Export DataCollector class.
module.exports = RoomDataCollector;

// Provide an interface to collect data by room, delete data by room, and
// "iterate" over that data by room through a stream.
// @param {CRUDManager}
function RoomDataCollector(crudManager) {
  this.crudManager = crudManager;
  this._keysPerRoom = {};

  this.crudManager.on('create', function(id) {
    var room = id.substring(0, id.lastIndexOf('-'));
    if (this._keysPerRoom[room] === undefined) {
      this._keysPerRoom[room] = [];
    }

    this._keysPerRoom[room].push(id);
  }.bind(this));
}

// Add data to the collection.
// @param {string} room name of room to add data to
// @param {object} data arbitrary data to store in room
// @returns {Promise}
RoomDataCollector.prototype.add = function(room, data) {
  return this.crudManager.create(
    room + '-' + Math.random().toString(36).substring(2),
    data
  );
};

// Get a stream of the data in a given room.
//
// If a room has no data when getDataForRoom is called, the returned stream
// soon after will end, emitting no objects.
// @param {string} room name of room to lookup data for
// @returns {Stream} a readable stream, each data entry will be an object
RoomDataCollector.prototype.getStream = function(room) {
  return new CRUDValueStream(
    this.crudManager,
    (this._keysPerRoom[room] || []).slice()
  );
};

// Delete all data objects that are in a given room.
// @param {string} room name of room to delete data from
// @returns {Promise}
RoomDataCollector.prototype.delete = function(room) {
  if (this._keysPerRoom[room] === undefined) {
    return when();
  }

  var promise = when.map(this._keysPerRoom[room], function(key) {
    return this.crudManager.delete(key);
  }.bind(this));
  delete this._keysPerRoom[room];
  return promise;
};
