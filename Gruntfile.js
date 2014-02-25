'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('build', ['requirejs']);
  grunt.registerTask('test', ['jshint', 'testem']);

  grunt.registerTask('dev', ['test', 'server:hang']);
  grunt.registerTask('prod', ['test', 'build', 'server:prod:hang']);

  grunt.registerTask('default', ['dev']);
};
