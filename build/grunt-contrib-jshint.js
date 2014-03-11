'use strict';

module.exports = function(grunt) {
  grunt.config.set('jshint', {
    build: {
      src: ['Gruntfile.js', 'build/*.js'],
      options: {
        jshintrc: 'build/.jshintrc'
      }
    },

    client: {
      options: {
        jshintrc: 'src/client/.jshintrc',
      },
      src: ['src/client/**/*.js', 'src/activities/**/client/**/*.js']
    },

    client_test: {
      options: {
        jshintrc: 'test/unit/client/.jshintrc'
      },
      src: ['test/unit/client/tests/**/*.js']
    },

    server: {
      options: {
        jshintrc: 'src/server/.jshintrc'
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
        jshintrc: 'test/server/.jshintrc'
      },
      src: ['test/server/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
