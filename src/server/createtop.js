// @file Top server. Manages processes for sub servers and routes static traffic

'use strict';

var fs = require('fs');

// Third party libs.
var _ = require('lodash');
var _debug = require('debug')('cee');
var express = require('express');
require('express-resource');
var when = require('when');
var whenNode = require('when/node/function');

// Locally defined libs.
var ActivityManager = require('./activitymanager');
var CRUDReplicator = require('./crudreplicator');
var getActivities = require('./get-activities');
var MemoryStore = require('./storememory');
var namegen = require('./namegen');
var ServerManager = require('./servermanager');
var whenListening = require('./common').whenListening;
var pidFile = require('./pid-file');

// Start a server and return a promise of when that server is ready.
//
// @param {object} options
//   - port port to server on
//   - hostname hostname to attach to (eg. '0.0.0.0')
//   - scriptFilter function to filter scripts with
//   - pidfile string to store process identifiers for children
// @param debug debug module instance to use
// @returns {Promise} promise for server
module.exports.createTop = function(options, debug) {
  options = options || {};
  // debug instances iterate the color value even if they share the name of
  // another instance, so passing an instance around is the only way to
  // maintain that color value.
  debug = debug || _debug;

  // Create the manager instance.
  var manager = new ServerManager();

  manager.on('childrenChange', function(pids) {
    pidFile.write(options.pidfile, pids);
  });

  // Find scripts to boot, then launch those with the manager instance.
  var whenChildren = pidFile.read(options.pidfile)
    .catch(function() { return []; })
    .then(function(pids) {
      pids.forEach(function(pid) {
        try {
          process.kill(pid, 'SIGTERM');
        } catch (err) {}
      });

      // Now that any previously-existing processes have been killed, the pid
      // file should be emptied.
      return pidFile.write(options.pidfile, []);
    })
    .then(getActivities)
    .then(function(activities) {
      if (options.scriptFilter) {
        activities = activities.filter(function(activity) {
          return options.scriptFilter(activity.serverIndex);
        });
      }

      return when.map(activities, function(activity) {
        return manager.launch(activity.slug, activity.serverIndex);
      });
    })
    .then(function() {debug('all children are ready');})
    .catch(function(e) {
      // Log error, then re-throw.
      console.error(e.stack || e);
      throw e;
    });

  // Create the express application.
  var app = express();

  app.use(express.json());

  // Route normal web traffic to /activities/:name to children.
  app.all('/activities/:name*', function(req, res) {
    // Edit the url that the child server sees. /activities/:name/status
    // becomes /status.
    req.url = req.params[0] || '/';
    manager.proxyWeb(req.params.name, [req, res]);
  });

  app.set('view engine', 'jade');
  app.set('views', 'client');

  app.configure('development', function() {
    app.use('/bower_components', express.static('../bower_components'));
    app.use('/node_modules', express.static('../node_modules'));
    app.set('devMode', true);
  });

  app.configure('production', function() {
    app.use('/bower_components', express.static('bower_components'));
    app.use('/node_modules', express.static('node_modules'));
  });

  app.use('/', express.static('client'));
  // In order to properly support pushState, serve the index HTML file for
  // GET requests to any directory.
  var indexRouteReady = getActivities().then(function(activityData) {
    app.get(/\/$/, function(req, res) {
      res.render('index.jade', {
        dev: !!app.get('devMode'),
        activities: activityData
      });
      res.end();
    });
  });

  app.get('/status', function(req, res) {
    res.send(200, 'ok');
  });

  // Start listening. By default let the kernel gives us a port. But otherwise
  // a port can be specified.
  var server = app.listen(options.port || 0, options.hostname);

  // Use the server's close method as a hook to kill the sub servers.
  (function() {
    var _close = server.close;
    server.close = function(cb) {
      // Close the express server before killing all child servers. This
      // ensures that the top server's connection to its children are safely
      // closed *before* the children are killed.
      return whenNode.call(_close.bind(server))
        .then(manager.killAll.bind(manager))
        .then(function() {debug('all children are stopped');})
        .always(cb);
    };
  }());

  // Load configurations for name generation.
  var whenNameGensLoad = when
    .map([
      __dirname + '/names/room.json',
      __dirname + '/names/group.json'
    ], function(file) {
      return whenNode.call(fs.readFile, file)
        .then(JSON.parse)
        // Iterate over values in the dicts key. If it is a string load that
        // path as JSON.
        .then(function(obj) {
          var promises = [];
          _.each(obj.dicts, function(dict, key) {
            if (typeof dict === 'string') {
              promises.push(whenNode
                .call(
                  fs.readFile,
                  __dirname + '/names/' + dict,
                  { encoding: 'utf8' }
                )
                .then(JSON.parse)
                .then(function(dict) {
                  obj.dicts[key] = dict.words;
                })
              );
            }
          });
          return when.all(promises).yield(obj);
        });
    });

  // Build the activity manager and replicate to child servers.
  whenNameGensLoad
    .spread(function(roomNameConfig, groupNameConfig) {
      return getActivities().then(function(activityData) {
        // Filter activites that need rooms.
        activityData = activityData.filter(function(activity) {
          return activity.config.roomBased;
        });

        var activityManager = new ActivityManager({
          // Keep rooms for 2 days.
          existFor: 2 * 24 * 60 * 60 * 1000,
          // Start all rooms with 5 groups.
          baseGroups: 5,
          roomNameGen: namegen.factory(roomNameConfig),
          groupNameGen: namegen.factory(groupNameConfig),
          roomStore: new MemoryStore(),
          groupStore: new MemoryStore(),
          lookupStore: new MemoryStore(),
          activities: activityData
        });

        // Configure room and group replication.
        activityManager.eachActivity(function(activity, key) {
          new CRUDReplicator({
            manager: activity.managers.room,
            type: 'room',
            target: manager._children[key].process
          });

          new CRUDReplicator({
            manager: activity.managers.group,
            type: 'group',
            target: manager._children[key].process
          });
        });

        // Create the room and group RESTful resources.
        app.resource('api/room', activityManager.roomResource());
        app.resource('api/group', activityManager.groupResource());

        // Patch server.close to shutdown activity rooms.
        (function() {
          var _close = server.close;
          server.close = function(cb) {
            return activityManager.shutdown()
              .yield(whenNode.call(_close.bind(server)))
              .then(function() {debug('all activity rooms are closed');})
              .always(cb);
          };
        }());
      });
    });

  // Websockets use the upgrade path. Figure out which sub to proxy to.
  server.on('upgrade', function(req, socket, head) {
    // TODO: Some of this could be replaced with a specialty express app
    // for websocket connections that would be able to use express's
    // path matching.
    var match = /\/activities\/([-\w]+)(.*)/.exec(req.url);
    var name = match[1];
    var newUrl = match[2];
    req.url = newUrl;
    manager.proxyWs(name, [req, socket, head]);
  });

  // Wait for everything to set up that can.
  return when
    .all([
      indexRouteReady,
      // When the server is listening.
      whenListening(server, debug),
      // Wait for the children.
      whenChildren
    ])
    // If any error occured, tear everything down.
    .catch(function(e) {
      return whenChildren
        .then(manager.killAll.bind(manager))
        .then(function() {
          throw e;
        });
    })
    // Yield the server for further work outside of serve().
    .yield(server);
};
