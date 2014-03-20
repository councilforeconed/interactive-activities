/**
 * @file `main.js` should export a view constructor (typically a subclass of
 * `ActivityView`. Note that the factory function will only be invoked when the
 * activity is first loaded. Subsequent visits to a given activity will trigger
 * the creation of new view instances.
 */
define(function(require) {
  'use strict';

  var HomeView = require('../components/home/home');

  return HomeView;
});
