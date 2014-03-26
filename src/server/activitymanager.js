'use strict';

// Third party libs
var _ = require('lodash');
var when = require('when');

// Locally defined libs
var ActivityGroupResource = require('./activitygroupresource');
var ActivityRoomResource = require('./activityroomresource');
var CRUDManager = require('./crudmanager');

// @export Activity Manager
module.exports = ActivityManager;

// Manage rooms and groups for multi-user activities.
// @params options
//    - {number} maxGroups maximum number of groups per room
//    - {namegen} roomNameGen
//    - {namegen} groupNameGen
//    - {Store} roomStore
//    - {Store} groupStore
//    - {Store} lookupStore a store of room or group name to an object of
//      activity, room, and group.
//    - {array} activities options for each activity by key
//      - slug required
//      - baseGroups
//      - existFor
// @constructor
function ActivityManager(options) {
  this.options = options;

  // Restrict name generation to one set at a time, waiting for the last set to
  // have made sure it has unique names before generating the next set. Promises
  // are used to do this in a mutex-like fashion.
  this._lastNameLock = when();

  this._activities = {};
  this.managers = {};
  // Lookup manager
  this.lookupManager = new CRUDManager({ store: options.lookupStore });

  // Track pairs of [room name, expiration date in millis].
  this._roomExpirePairs = [];
  this._removeTimeoutId = undefined;

  // Setup the set of activity CRUDManagers.
  options.activities.forEach(this._addActivity, this);
}

// Create a room.
//
// Generate a room name and create an object with the related data, store in the
// roomStore, create related groups, and then return the final room object
// value.
//
// @params options
//    - {number} existFor milliseconds to exist
//    - {string} activity
// @fires ActivityManager#room_create
// @fires ActivityManager#group_create
// @returns {Promise}
ActivityManager.prototype.create = function(options) {
  var roomNameLockDefer = when.defer();
  var roomName;
  var roomValue;
  var self = this;
  var activity = this.activity(options.activity);
  return this
    // gen room name
    ._genNames(1, this.options.roomNameGen, roomNameLockDefer.promise)
    // create room
    .then(function(names) {
      roomName = names[0];

      roomValue = {
        id: roomName,
        activity: options.activity,
        room: roomName,
        created_at: new Date(),
        expires_at: new Date(
          Date.now() +
            (options.existFor || activity.existFor || self.options.existFor)
        ),
        groups: []
      };

      return when.all([
        activity.managers.room.create(roomName, roomValue)
      ]);
    })
    // Unlock the promise "mutex" to let the next thing name something.
    .then(roomNameLockDefer.resolve, roomNameLockDefer.reject)
    .then(function() {
      // Insert the room's expiration time into the array of pairs.
      var index = _.findIndex(self._roomExpirePairs, function(pair) {
        return pair[1] > roomValue.expires_at;
      });
      self._roomExpirePairs.splice(index, 0, [roomName, roomValue.expires_at]);
      // Schedule removal.
      self._scheduleRemove();

      // Call addGroups, which will gen group names, make groups and update
      // the room with those groups.
      return self.addGroups(
        roomName,
        options.baseGroups || activity.baseGroups || self.options.baseGroups
      );
    });
};

// Add groups a room that exists.
// @param roomName
// @param count number of groups to create
// @returns {Promise} updated room object with new groups
ActivityManager.prototype.addGroups = function(roomName, count) {
  var groupNameLockDefer = when.defer();
  var triple;
  var managers;
  var room;
  var self = this;
  return self.lookupManager.read(roomName)
    // Read the room from the activity's room manager.
    .then(function(_triple) {
      triple = _triple;
      managers = self.managers[_triple.activity];
      return managers.room.read(roomName);
    })
    .then(function(_room) {
      room = _room;
    })
    .yield(this._genNames(
      count,
      this.options.groupNameGen,
      groupNameLockDefer.promise
    ))
    // Add group object to room and store groups in the activity's
    // group manager.
    .then(function(names) {
      return when.map(names, function(name) {
        room.groups.push({
          name: name
        });
        return managers.group.create(name, {
          id: name,
          activity: triple.activity,
          room: triple.room,
          group: name
        });
      });
    })
    .then(groupNameLockDefer.resolve, groupNameLockDefer.reject)
    .then(function() {
      return managers.room.update(roomName, room);
    });
};

// Unschedule room expiration, then forcefully expire all rooms.
// @returns {Promise} resolve when all rooms and groups have been deleted.
ActivityManager.prototype.shutdown = function() {
  this._unscheduleRemove();
  return this._deleteExpired(Infinity);
};

// An object that can be consumed by express-resource to provide a RESTful
// CRUD interface for rooms.
ActivityManager.prototype.roomResource = function() {
  return ActivityRoomResource.factory(this);
};

// An object that can be consumed by express-resource to provide a RESTful
// CRUD interface for groups.
ActivityManager.prototype.groupResource = function() {
  return ActivityGroupResource.factory(this);
};

ActivityManager.prototype.activity = function(name) {
  return this._activities[name];
};

ActivityManager.prototype.eachActivity = function(fn, ctx) {
  for (var key in this._activities) {
    fn.call(ctx || this, this._activities[key], key);
  }
};

// Internal method that creates activity related managers and listeners to
// update the lookupManager when rooms and groups change.
ActivityManager.prototype._addActivity = function(options) {
  var self = this;
  var lookupManager_delete = self.lookupManager.delete.bind(self.lookupManager);

  self._activities[options.slug] = _.merge({}, options);

  var managers = self.managers[options.slug] = {
    room: new CRUDManager({ store: self.options.roomStore }),
    group: new CRUDManager({ store: self.options.groupStore })
  };
  self._activities[options.slug].managers = managers;

  managers.room.on('create', function(name, value) {
    self.lookupManager.create(name, {
      id: name,
      activity: value.activity,
      room: name,
      group: undefined
    });
  });
  managers.room.on('delete', lookupManager_delete);

  managers.group.on('create', function(name, value) {
    self.lookupManager.create(name, {
      id: name,
      activity: value.activity,
      room: value.room,
      group: name
    });
  });
  managers.group.on('delete', lookupManager_delete);
};

// Internal method to delete a room and its groups.
// @returns {Promise}
ActivityManager.prototype._delete = function(name) {
  var groups;
  var managers;
  var self = this;
  return self.lookupManager.read(name)
    .then(function(triple) {
      managers = self.managers[triple.activity];
      return managers.room.read(triple.room);
    })
    .then(function(room) {
      groups = room.groups;
      return managers.room.delete(room.room);
    })
    .then(function() {
      var groupManager = managers.group;
      return when.map(groups, function(group) {
        return groupManager.delete(group.name);
      });
    });
};

// If not scheduled, schedule the next call to _removeStep.
ActivityManager.prototype._scheduleRemove = function() {
  if (this._roomExpirePairs.length && this._removeTimeoutId === undefined) {
    var nextTime = this._roomExpirePairs[0][1];
    this._removeTimeoutId = setTimeout(function() {
      this._removeTimeoutId = undefined;
      this._deleteExpired();
      this._scheduleRemove();
    }.bind(this), nextTime - Date.now() + 10);
  }
};

// Used in graceful process termination. Otherwise the process cannot exit
// until all rooms have been removed.
ActivityManager.prototype._unscheduleRemove = function() {
  clearTimeout(this._removeTimeoutId);
  this._removeTimeoutId = undefined;
};

// Delete expired rooms.
ActivityManager.prototype._deleteExpired = function(now) {
  now = now ? now : Date.now();
  var promises = [];
  while (this._roomExpirePairs.length && this._roomExpirePairs[0][1] < now) {
    promises.push(this._delete(this._roomExpirePairs.shift()[0]));
  }
  return when.all(promises);
};

// Check that a name is not used.
ActivityManager.prototype._nameCheck = function(name) {
  return this.lookupManager._store.hasKey(name)
    .then(function(hasKey) {
      if (hasKey) {
        throw new Error('Key, ' + name + ', already used.');
      }
      return name;
    });
};

// Wait for past lockPromises to resolve, then generate n names with the given
// namegen and use check to make sure they are not duplicates.
// @returns {Promise}
ActivityManager.prototype._genNames = function(n, namegen, lockPromise) {
  var _lastNameLock = this._lastNameLock;
  this._lastNameLock = this._lastNameLock.yield(lockPromise);

  var check = this._nameCheck.bind(this);

  return _lastNameLock
    .always(function() {
      var genAttempt = function() {
        return when.resolve(namegen().join('-'))
          .then(check)
          .catch(genAttempt);
      };

      var genNAttempt = function() {
        var array = [];
        for (var i = 0; i < n; i++) {
          array.push('');
        }

        return when.map(array, genAttempt)
          .then(function(names) {
            if (_.unique(names).length !== names.length) {
              throw new Error('A name was repeated.');
            }
            return names;
          })
          .catch(genNAttempt);
      };
      return genNAttempt();
    });
};
