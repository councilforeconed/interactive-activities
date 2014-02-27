'use strict';

module.exports = function(grunt) {
  grunt.loadTasks('build');

  grunt.registerTask('build', ['requirejs', 'copy:prod']);
  grunt.registerTask('dev', ['server:hang']);
  grunt.registerTask('prod', ['build', 'server:hang']);
  grunt.registerTask('test', ['testem']);

  grunt.registerTask('default', ['dev']);
};
