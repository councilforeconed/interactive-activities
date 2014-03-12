/**
 * @file A component is a logical group of UI code. Usually, it comprises a
 * JavaScript module (which exports a View), a CSS file, and an HTML template.
 */
define(function(require) {
  'use strict';
  var ActivityView = require('components/activity/activity');

  // A RequireJS plugin is used to load CSS. Note that the file type is
  // implicit. The plugin will insert a new HTML `<style>` tag into the
  // document and inject the contents of the file. This automatic injection is
  // why the return value from the call to `require` is ignored.
  require('css!./home.css');

  // Some modules simply extend other modules. This is often the case for
  // jQuery plugins. In these cases, the module value itself is not directly
  // useful, so the return value from the call to `require` is ignored.
  require('rangeslider');

  var Home = ActivityView.extend({
    // A RequireJS plugin is used to load templates. Note that the file type is
    // implicit.
    homeTemplate: require('jade!./home'),
    title: 'Example Activity',
    description: 'This activity is intended to demonstrate things.',
    instructions: 'Strings can go here.'
  });

  return Home;
});
