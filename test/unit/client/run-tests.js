mocha.ui('tdd');

testRequire([
  'scripts/formatters/usd',
  'scripts/fragment-data',
  'scripts/window-emitter'
], function() {
  mocha.run();
});
