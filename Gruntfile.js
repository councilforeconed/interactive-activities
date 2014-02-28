'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('default', ['jshint', 'testem']);
  grunt.registerTask('test', ['jshint', 'testem']);
};
