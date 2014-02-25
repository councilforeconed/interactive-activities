'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('dev', ['server:hang']);
  grunt.registerTask('default', ['dev']);
};
