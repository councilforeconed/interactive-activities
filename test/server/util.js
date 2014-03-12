'use strict';

var assert = require('chai').assert;

exports.mustThrow = function() {
  assert.fail('should have thrown an error');
};

exports.testErrorMessage = function(re) {
  return function(e) {
    if (re.test(e.message)) {
      return;
    }
    throw e;
  };
};
