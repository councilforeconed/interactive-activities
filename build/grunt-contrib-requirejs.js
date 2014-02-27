'use strict';

module.exports = function(grunt) {
  grunt.config.set('requirejs', {
    prod: {
      options: {
        baseUrl: 'client',
        appDir: 'src',
        paths: {
          jquery: '../../bower_components/jquery/dist/jquery',
          underscore: '../../bower_components/lodash/dist/lodash',
          _: '../../bower_components/lodash/dist/lodash',
          backbone: '../../bower_components/backbone/backbone',
          jade: '../../bower_components/require-jade/jade',
          'socket.io': '../../bower_components/socket.io-client/dist/socket.io',

          activities: '../activities'
        },
        mainConfigFile: 'src/client/scripts/amd-config.js',
        dir: 'out',
        optimize: 'none',
        pragmasOnSave: {
          excludeJade: true
        },
        modules: generateRjsModules()
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
};

/**
 * In order to seamlessly optimize any and all valid activities, the `modules`
 * configuration for the r.js optimizer must be programatically generated.
 *
 * @returns {Array} Configuration data for each module that should be
 *                  optimized. See the r.js documentation for details on the
 *                  format of this data:
 *                  http://requirejs.org/docs/optimization.html
 */
function generateRjsModules() {
  var activities = require('../src/server/get-activities')();
  var mainModule = {
    name: 'scripts/main',
    include: [
      // Include RequireJS to support lazy loading of activities
      '../../bower_components/requirejs/require',
      // Include the configuration to ensure that:
      // 1. the application initializes immediately (via the `deps`
      //    option)
      // 2. pathing information is consitent with development mode for
      //    runtime dependency resolution (specifically in service of
      //    lazily-loaded activities)
      'scripts/amd-config'
    ]
  };
  var activityModules = activities.map(function(activity) {
    return {
      name: 'activities/' + activity.slug + '/client/scripts/main',
      // Activities will only be run in the context of the site application, so
      // optimized builds should omit any modules required by the "main"
      // module.
      exclude: ['scripts/main', 'socket.io']
    };
  });

  return [mainModule].concat(activityModules);
}
