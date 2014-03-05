mocha.ui('tdd');

testRequire([
  'components/activity/collection-view',
  'scripts/layout'
], function() {
  mocha.run();
});
