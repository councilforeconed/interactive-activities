'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('build', ['requirejs']);
  grunt.registerTask('dev', ['server:hang']);
  grunt.registerTask('prod', ['build', 'server:hang']);

  grunt.registerTask('default', ['dev']);
};
