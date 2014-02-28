module.exports = function(grunt) {
  grunt.config.set('testem', {
    server: {
      options: require('../testem.json'),
      src: 'test/server/*.html'
    }
  });

  grunt.loadNpmTasks('grunt-testem');
};
