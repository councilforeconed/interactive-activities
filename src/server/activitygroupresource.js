'use strict';

// Export a factory function for ActivityGroupResource.
module.exports.factory = function(activityManager) {
  return new ActivityGroupResource(activityManager);
};

// The key on a express request where the id in /prefix/:id is stored.
var id = 'activity_group';

// Express resource consumable class. Provides a RESTful interface to
// ActivityManager's group resource data.
function ActivityGroupResource(activityManager) {
  this.activityManager = activityManager;
  // The key on a express request where the id in /prefix/:id is stored.
  this.id = id;

  // Bind functions to this instance, since express-resource doesn't.
  this.load = this.load.bind(this);
  this.show = this.show.bind(this);
}

// Express resource load function for loading a group.
ActivityGroupResource.prototype.load = function(id, fn) {
  var self = this;
  self.activityManager.lookupManager.read(id)
    .then(function(triple) {
      return self.activityManager.managers[triple.activity].group.read(id);
    })
    .then(function(group) { fn(undefined, group); }, fn);
};

// Show the group's data.
ActivityGroupResource.prototype.show = function(req, res) {
  res.json(req[id]);
};
