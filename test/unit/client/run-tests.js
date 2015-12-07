mocha.ui('tdd');

testRequire([
  'scripts/formatters/usd',
  'scripts/fragment-data',
  'scripts/sync',
  'scripts/window-emitter',
  'activities/pizza/game-model',
  'activities/pizza/pizza-collection'
], function() {
  mocha.run();
});
