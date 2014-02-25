'use strict';
var spawn = require('child_process').spawn;

/**
 * Simple Grunt.js task for running the project's server. This is equivalent to
 * executing the following command from the root of the project:
 *
 *     $ node . --port 8000
 *
 * Wrapping the above in a Grunt task simplifies the development workflow
 * without coupling Grunt.js with production environments.
 *
 * Recognizes the following flags:
 *
 * - hang: Run the server indefinitely.
 * - prod: Run the server in production mode (via the NODE_ENV environmental
 *         variable).
 */
module.exports = function(grunt) {
  grunt.registerTask('server', 'run the server', function() {
    var childEnv = {};
    var done = function() {
      child.removeListener('exit', done);
      child.removeListener('close', done);
      child.removeListener('error', done);
      grunt.fail.fatal('Server task exited unexpectedly.');
    };

    if (this.args.indexOf('hang') > -1) {
      this.async();
    }

    Object.keys(process.env).forEach(function(key) {
      childEnv[key] = process.env[key];
    });

    if (this.args.indexOf('prod') > -1) {
      childEnv.NODE_ENV = 'production';
    }

    var child = spawn(process.argv[0],
      ['.', '--port', 8000],
      {
        env: childEnv,
        stdio: 'inherit'
      }
    );

    process.on('exit', function() {
      child.kill();
    });
    child.on('exit', done);
    child.on('close', done);
    child.on('error', done);
  });
};
