'use strict';

module.exports = function(grunt) {
  grunt.config.set('copy', {
    prod: {
      files: [
          { expand: true, src: ['bower_components/**'], dest: 'out' }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
