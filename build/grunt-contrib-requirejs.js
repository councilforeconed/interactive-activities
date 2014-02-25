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
          jade: '../../bower_components/require-jade/jade'
        },
        mainConfigFile: 'src/client/scripts/amd-config.js',
        dir: 'out',
        optimize: 'none',
        pragmasOnSave: {
          excludeJade: true
        },
        modules: [
          {
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
          },
          {
            name: '../activities/money-creation/client/scripts/main',
            exclude: ['scripts/main'],
            insertRequire: ['../activities/money-creation/client/scripts/main']
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
};
