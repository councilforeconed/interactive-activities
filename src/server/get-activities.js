'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var when = require('when');
var whenNode = require('when/node/function');
var statPromise = whenNode.bind(fs.stat);

var activitiesDir = path.join(__dirname, '../activities');

/**
 * Return a promise for data describing each valid activity. Each element in the
 * array will contain:
 *
 * - slug - Unique identifier
 * - directory - Fully-resolved path to the activity's directory
 * - configFile - Fully-resolved path to the activity's configuration file
 * - serverIndex - Fully-resolved path to the activity server's index file
 * - config - Activity configuration data
 *
 * The promise will be rejected if the directory reserved for activities
 * contains any files or directories that do not conform to the expected
 * structure.
 */
module.exports = function() {
  return whenNode.call(fs.readdir, activitiesDir)
    .then(_.partialRight(when.map, function(name) {
      var directory = path.join(activitiesDir, name);
      var activity = {
        slug: name,
        directory: directory,
        configFile: path.join(directory, 'config.json'),
        serverIndex: path.join(directory, 'index.js')
      };

      return statPromise(activity.serverIndex)
        .then(function(stat) {
        if (!stat.isFile()) {
          throw new Error('No server index found for activity: ' + name);
        }
        return whenNode.call(
          fs.readFile, activity.configFile, { encoding: 'utf8' }
        );
      })
      .then(function(configText) {
        try {
          activity.config = JSON.parse(configText);
        } catch(err) {
          throw new Error('Unable to parse JSON for activity: ' + name);
        }
        return activity;
      });
    }));
};
