'use strict';

// Export a factory function for ActivityRoomResource.
module.exports.factory = function(activityManager) {
  return new ActivityRoomResource(activityManager);
};

// The key on a express request where the id in /prefix/:id is stored.
var id = 'activity_room';

// Express resource consumable class. Provides a RESTful interface to
// ActivityManager's create and addGroups methods and showing room data.
function ActivityRoomResource(activityManager) {
  this.activityManager = activityManager;
  // The key on a express request where the id in /prefix/:id is stored.
  this.id = id;

  // Bind functions to this instance, since express-resource doesn't.
  this.load = this.load.bind(this);
  this.create = this.create.bind(this);
  this.show = this.show.bind(this);
  this.update = this.update.bind(this);
}

// Express resource load function. Takes an id from the url and turns it into
// an object, calling fn(error, object) when its ready. Once loaded,
// request[id] will return the object this function creates.
ActivityRoomResource.prototype.load = function(id, fn) {
  var self = this;
  self.activityManager.lookupManager.read(id)
    .then(function(triple) {
      return self.activityManager.managers[triple.activity].room.read(id);
    })
    .then(function(room) { fn(undefined, room); }, fn);
};

// Create a room and related groups when users requests POST /prefix/ without
// an id.
ActivityRoomResource.prototype.create = function(req, res, next) {
  this.activityManager.create({ activity: req.body.activity })
    .then(function(room) {
      res.json(room);
    }, next);
};

// Show a room's data.
ActivityRoomResource.prototype.show = function(req, res) {
  res.json(req[id]);
};

// Respond a PUT /prefix/:id request by adding groups if that is in the
// PUT's body.
ActivityRoomResource.prototype.update = function(req, res, next) {
  if (req.body.addGroups) {
    this.activityManager.addGroups(req[id].room, req.body.addGroups)
      .then(function(room) {
        res.json(room);
      }, next);
    return;
  }
  next(
    new Error('No defined response for body. ' + JSON.stringify(req.body))
  );
};
