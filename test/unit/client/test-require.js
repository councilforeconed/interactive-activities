/**
 * A helper function for loading application AMD modules from a test
 * environment. See the following blog post for more details on the design of
 * this logic:
 * http://weblog.bocoup.com/effective-unit-testing-with-amd/
 */
window.testRequire = function(tests, done) {
  'use strict';

  var idx = tests.length;

  // Rewrite test module IDs to be relative to the application's `baseUrl`
  while (--idx > -1) {
    tests[idx] = '../test/unit/client/tests/' + tests[idx];
  }

  require(['lib/chai'], function(chai) {

    // Intentionally leak the `assert` utility so all tests may use it
    // implicitly.
    window.assert = chai.assert;

    // Stub out the application's `main` module so the application does not
    // initialize in the test environment.
    define('scripts/main', {});

    // Load the application AMD configuration so that RequireJS can correctly
    // resolve the module IDs required by the modules under test.
    require(['../../../src/client/scripts/amd-config'], function() {

      // Override the application's `baseUrl` (which normally assumes a
      // pushState-enabled server serving all assets from the root `/`) to
      // instead map to the client asset location relative to the test runner.
      require({
        baseUrl: '../../../bower_components',
        paths: {
          activities: '../src/activities',
          components: '../src/client/components',
          scripts: '../src/client/scripts',

          sinon: '../node_modules/sinon/lib/sinon'
        },
        shim: {
          'sinon/util/fake_timers': {
            exports: 'sinon'
          }
        }
      });

      // Finally, load the tests!
      (function requireOne(tests, modules) {
        if (tests.length) {
          require(tests.slice(0, 1), function(module) {
            modules.push(module);
            requireOne(tests.slice(1), modules);
          });
        } else {
          done.apply(undefined, modules);
        }
      })(tests.slice(), []);
    });
  });
};
