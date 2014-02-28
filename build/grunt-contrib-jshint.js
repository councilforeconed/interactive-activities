module.exports = function(grunt) {
  grunt.config.set('jshint', {
    gruntfile: {
      options: {
        node: true
      },
      src: ['Gruntfile.js']
    },

    server: {
      options: {
        node: true
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
        node: true
      },
      src: ['test/server/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
