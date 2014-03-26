'use strict';

// Third party libs
var assert = require('chai').assert;

// Locally defined libs
var namegen = require('../../src/server/namegen');

suite('namegen', function() {
  var dicts = {
    adj: ['white', 'big', 'cool'],
    noun: ['ocean', 'space', 'mug']
  };

  test('return a function', function() {
    var gen = namegen.factory({ dicts: dicts });
    assert.isFunction(gen, 'namegen.factory returns a function');
  });

  test('create an array for values from the dicts', function() {
    var formula = ['adj', 'noun'];
    var gen = namegen.factory({ dicts: dicts, formula: formula });
    var values = gen();
    assert.lengthOf(values, formula.length, 'array is long as formula');
    for (var i = 0; i < values.length; i++) {
      assert.include(
        dicts[formula[i]], values[i],
        'word is from the dictionary'
      );
    }
  });
});
