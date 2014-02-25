'use strict';
var spawn = require('child_process').spawn;

/**
 * Simple Grunt.js task for running the project's server. This is equivalent to
 * executing the following command from the root of the project:
 *
 *     $ node .
 *
 * Wrapping the above in a Grunt task simplifies the development workflow
 * without coupling Grunt.js annbd production environments.
 *
 * Accepts an optional argument "hang" to facilitate running the server
 * indefinitely.
 */
module.exports = function(grunt) {
  grunt.registerTask('server', 'run the server', function() {
    if (this.args.indexOf('hang') > -1) {
      this.async();
    }

    var child = spawn(process.argv[0], ['.'], {
      stdio: 'inherit'
    });

    process.on('exit', function() {
      child.kill();
    });
  });
};
