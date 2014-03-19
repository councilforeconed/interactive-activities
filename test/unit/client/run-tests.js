mocha.ui('tdd');

testRequire([
  'scripts/formatters/usd',
  'scripts/fragment-data'
], function() {
  mocha.run();
});
