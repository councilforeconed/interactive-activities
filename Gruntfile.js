'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('test', ['jshint', 'testem']);
  grunt.registerTask('dev', ['test', 'server:hang']);
  grunt.registerTask('default', ['dev']);
};
