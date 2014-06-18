/**
 * @file Because the r.js configuration depends on factors that are fetched
 * asynchronously (i.e. the state of the file system), the Grunt task must be
 * configured asynchronously. Grunt does not support this directly, so a
 * wrapper task is necessary to suspend execution while the configuration is
 * generated.
 */
'use strict';

var getActivities = require('../src/server/get-activities');

module.exports = function(grunt) {
  grunt.initConfig({});

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask(
    'configure-requirejs',
    'Asynchronously configure and run the `grunt-contrib-requirejs` plugin',
    function() {
      var done = this.async();
      var args = this.args;
      var argString = this.args.length ? '' : (':' + args.join(':'));
      getActivities().then(function(activities) {
        grunt.config.set('requirejs', generateConfig(activities));

        grunt.task.run('requirejs' + argString);
        done();
      }, console.error.bind(console));
    }
  );
};

function generateConfig(activities) {
  // Library code that is shared between some activities (but not the
  // top-level application) is optimized into distinct modules. Although this
  // forces some activities to require multiple JavaScript files in
  // production, it also:
  // 1. minimizes the size of each individual activity
  // 2. avoids the need to re-define library code between activities
  var sharedLibraries = {
    npm: ['cloak'],
    bower: ['socket.io-client']
  };

  return {
    prod: {
      options: {
        baseUrl: '../bower_components',
        appDir: 'src',
        paths: {
          activities: '../src/activities',
          components: '../src/client/components',
          scripts: '../src/client/scripts'
        },
        shim: {
          d3: {
            exports: 'd3'
          },
          'd3.chart': {
            deps: ['d3']
          },
          rangeslider: {
            deps: [
              'jquery',
              'css!rangeslider.js/dist/rangeslider'
            ]
          }
        },
        mainConfigFile: 'src/client/scripts/amd-config.js',
        dir: 'out',
        optimize: 'none',
        pragmasOnSave: {
          excludeJade: true
        },
        modules: generateRjsModules(
          activities, [].concat(sharedLibraries.npm, sharedLibraries.bower)
        )
      }
    },
    node_modules: {
      options: {
        baseUrl: 'node_modules',
        dir: 'out/node_modules',
        paths: {
          activities: 'empty:',
          components: 'empty:',
          scripts: 'empty:'
        },

        skipDirOptimize: true,
        modules: getModuleDescriptors(sharedLibraries.npm),
        mainConfigFile: 'src/client/scripts/amd-config.js'
      }
    },
    bower_components: {
      options: {
        baseUrl: 'bower_components',
        dir: 'out/bower_components',
        // For some reason, r.js is attempting to load these paths (specified
        // in the main configuration file) as identifiers. Until I can figure
        // out why it is doing that, override them with the special
        // "empty:" value (since the `exclude` option has no effect):
        //
        // > It allows the optimizer to resolve the dependency to path, but
        // > then does not include it in the output.`
        //
        // Source: https://github.com/jrburke/r.js/blob/f1edce874d1eb1a3c171a4b64b7cf27cc40d76a8/build/example.build.js#L39-L49
        paths: {
          activities: 'empty:',
          components: 'empty:',
          scripts: 'empty:'
        },

        optimize: 'none',
        optimizeCss: 'none',
        skipDirOptimize: true,
        modules: getModuleDescriptors(sharedLibraries.bower),
        mainConfigFile: 'src/client/scripts/amd-config.js'
      }
    }
  };
}

/**
 * In order to seamlessly optimize any and all valid activities, the `modules`
 * configuration for the r.js optimizer must be programatically generated.
 *
 * @param {Array} activities A collection of objects describing valid
 *                activities. Each should define a `slug` property reflecting
 *                the directory it is contained within.
 * @param {Array} sharedLibraries Shared library module identifiers. These will
 *                be excluded from all activity modules for efficiency (see
 *                above for more detail).
 *
 * @returns {Array} Configuration data for each module that should be
 *                  optimized. See the r.js documentation for details on the
 *                  format of this data:
 *                  http://requirejs.org/docs/optimization.html
 */
function generateRjsModules(activities, sharedLibraries) {
  var mainModule = {
    name: 'scripts/main',
    include: [
      // Include RequireJS to support lazy loading of activities
      'requirejs/require',
      // Include the configuration to ensure that:
      // 1. the application initializes immediately (via the `deps`
      //    option)
      // 2. pathing information is consitent with development mode for
      //    runtime dependency resolution (specifically in service of
      //    lazily-loaded activities)
      'scripts/amd-config'
    ]
  };
  var roomModules = ['createroom', 'manageroom'].map(function(component) {
    return {
      name: 'components/' + component + '/' + component,
      exclude: ['scripts/main'].concat(sharedLibraries)
    };
  });
  var activityModules = activities.map(function(activity) {
    return {
      name: 'activities/' + activity.slug + '/client/scripts/main',
      // Activities will only be run in the context of the site application, so
      // optimized builds should omit any modules required by the "main"
      // module.
      exclude: ['scripts/main'].concat(sharedLibraries)
    };
  });
  var reportModules = [
    'reportjson',
    'reporthistogram',
    'reportgrouphistogram'
  ].map(function(name) {
    return {
      name: 'components/' + name + '/' + name,
      include: [
        'requirejs/require',
        // Report modules are standalone scripts. We force require to ignore
        // the normal main script and instead use our main script.
        'components/' + name + '/redefine-main',
        'scripts/amd-config'
      ]
      // While other modules exclude scripts/main we want to leave it in so
      // that its dependencies shared with our reports are not excluded. jQuery
      // is a good example. This isn't a perfect solution but it is one that is
      // more maintainable as there is less for us to keep track of, we don't
      // need duplicate amd-configs or duplicate targets.
      // exclude: ['scripts/main']
    };
  });

  return [mainModule]
    .concat(roomModules)
    .concat(activityModules)
    .concat(reportModules);
}

function getModuleDescriptors(moduleIds) {
  return moduleIds.map(function(id) {
    return { name: id, exclude: ['underscore'] };
  });
}
