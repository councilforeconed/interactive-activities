'use strict';

module.exports = function(grunt) {
  grunt.config.set('testem', {
    client: {
      // These options are defined in the root of the project so the `testum`
      // command can be used to run the tests (where available)
      options: require('../.testem-client.json')
    },
    server: {
      src: ['../test/server/*.html'],
      options: require('../.testem-server.json')
    }
  });

  grunt.loadNpmTasks('grunt-contrib-testem');
};
