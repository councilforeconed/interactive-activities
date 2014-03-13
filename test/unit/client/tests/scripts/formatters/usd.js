define(function(require) {
  'use strict';
  var formatUSD = require('scripts/formatters/usd');

  test('zero', function() {
    assert.equal(formatUSD(0), '$0.00');
  });

  test('fractional values', function() {
    assert.equal(formatUSD(1.2), '$1.20');
  });

  test('rounding to nearest cent', function() {
    assert.equal(formatUSD(0.005), '$0.01');
  });

  test('high precision', function() {
    assert.equal(formatUSD(0.9999999999999), '$1.00');
  });

  test('negative values', function() {
    assert.equal(formatUSD(-12.2), '-$12.20');
  });

  suite('comma insertion', function() {
    test('thousands', function() {
      assert.equal(formatUSD(1234), '$1,234.00');
    });

    test('millions', function() {
      assert.equal(formatUSD(12345678.9), '$12,345,678.90');
    });
  });
});
