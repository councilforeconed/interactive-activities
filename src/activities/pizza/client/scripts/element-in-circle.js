/**
 * @file - Determine whether an element is positioned within the bounds of the
 * circle defined by another element's bounding box.
 */
define(function() {
  'use strict';

  return function($target, $circle) {
    var circleOffset = $circle.offset();
    var targetOffset = $target.offset();
    var radius = $circle.width() / 2;
    var relative = {
      top: targetOffset.top - circleOffset.top - radius,
      left: targetOffset.left - circleOffset.left - radius
    };
    var distance = Math.sqrt(
      Math.pow(relative.top, 2) + Math.pow(relative.left, 2)
    );

    return distance < radius;
  };
});
