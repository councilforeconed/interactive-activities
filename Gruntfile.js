'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      gruntfile: {
        options: {
          node: true
        },
        src: ['Gruntfile.js']
      },

      server: {
        options: {
          node: true
        },
        src: ['src/index.js', 'src/server/*.js']
      },

      server_activities: {
        options: {
          node: true
        },
        src: ['src/activities/*/{index,server/**/*}.js']
      },

      server_test: {
        options: {
          node: true
        },
        src: ['test/server/*.js']
      }
    },

    testem: {
      server: {
        options: require('./testem.json'),
        src: 'test/server/*.html'
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'testem']);
  grunt.registerTask('test', ['jshint', 'testem']);
};
