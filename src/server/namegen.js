'use strict';

// Create a name generator function.
// @param {object} options
//    - {object} dicts hash of dictionaries
//    - {array} formula array of names that replaced by a random word in the
//      corresponding dictionary
// @returns function that created a new array filled with values from dicts
module.exports.factory = function(options) {
  var dicts = options.dicts;
  var formula = options.formula;
  var random = options.random || Math.random;

  var getWord = function(dictName) {
    var dict = dicts[dictName];
    return dict[Math.floor(random() * dict.length)];
  };

  return function() {
    var gen;
    gen = formula.map(getWord);
    return gen;
  };
};
