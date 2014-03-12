mocha.ui('tdd');

testRequire([
  'scripts/formatters/usd'
], function() {
  mocha.run();
});
