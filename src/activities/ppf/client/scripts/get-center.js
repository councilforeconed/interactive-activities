/*
 * @file Determine the center coordinates of a given jQuery-wrapped element.
 */
define(function() {
  'use strict';

  return function($el) {
    var offset = $el.offset();
    var css = $el.css([
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border-top-width', 'border-left-width', 'border-bottom-width',
      'border-right-width'
    ]);
    var width = $el.width() +
      parseFloat(css['padding-left']) +
      parseFloat(css['padding-right']) +
      parseFloat(css['border-left-width']) +
      parseFloat(css['border-right-width']);
    var height = $el.height() +
      parseFloat(css['padding-top']) +
      parseFloat(css['padding-bottom']) +
      parseFloat(css['border-top-width']) +
      parseFloat(css['border-bottom-width']);

    return {
      x: offset.left + width / 2,
      y: offset.top + height / 2
    };
  };
});
