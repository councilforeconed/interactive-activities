module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      server: {
        options: {
          node: true
        },
        src: ['src/index.js', 'src/server/*.js']
      }
    },

    testem: {
      server: {
        options: {
          launchers: {
            Mocha: {
              command: [
                'node_modules/.bin/mocha',
                '--ui tdd',
                '--reporter tap',
                'test/server/test_*.js'
              ].join(' '),
              protocol: 'tap'
            }
          },
          launch_in_ci: ['Mocha']
        },
        src: 'test/server/*.html'
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'testem']);
};
