define(function(require) {
  'use strict';

  var $ = require('jquery');

  var ActivityView = require('components/activity/activity');
  var getCenter = require('../../scripts/get-center');

  require('css!./main');
  require('jquery.pep');

  var Home = ActivityView.extend({
    homeTemplate: require('jade!./main'),
    config: require('json!../../../config.json'),
    description: require('jade!./../../description')(),
    instructions: require('jade!./../../instructions')(),

    afterRender: function() {
      var $slopeElems = this.$('.ppf-slope');

      // The jQuery.pep plugin dynamically infers the position of draggable
      // elements and then explicitly sets them. When this operation takes
      // place on a collection of elements, the order of the elements is
      // significant--fixing the position of one element may alter the position
      // of another before its position has been set.
      // By default, the jQuery collection will contain the slope elements in
      // document order. The collection is reversed so that the position of
      // each element can be set without affecting the position of the yet-to-
      // be positioned elements.
      Array.prototype.reverse.call($slopeElems);

      $slopeElems
        .pep({
          droppable: '.ppf-graph-target',
          droppableActiveClass: 'ppf-graph-target-active',
          activeClass: 'ppf-slope-active',
          shouldEase: false,
          revert: true,

          /**
           * A draggable element should only be considered "overlapping" if its
           * center is contained within a target element.
           */
          overlapFunction: function($a, $b) {
            var a = $a.offset();
            var bCenter = getCenter($b);

            a.right = a.left + $a.width();
            a.bottom = a.top + $a.height();

            return bCenter.x > a.left && bCenter.x < a.right &&
              bCenter.y > a.top && bCenter.y < a.bottom;
          },

          revertIf: function() {
            var currentSlope = this.$el.data('slope-val');
            var $target = $('.ppf-graph-target-active');
            var targetSlope = $target.data('slope-val');

            $target.removeClass('ppf-graph-target-active');

            return $target.length < 1 || currentSlope !== targetSlope;
          }
        });
    }

  });

  return Home;
});
