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
      var currentEl;

      this.$('.ppf-slope')
        .each(function() {
          var $el = $(this);
          $el.css($el.position());
        })
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

          /**
           * Because jQuery.pep [1] does not invoke the `revertIf` method with
           * any contextual data, the current drag target and drop target must
           * be found with other mechanisms (the DOM must be queried for the
           * drop target, and the drag target must be tracked using the
           * plugin's `start` and `end` hooks.
           *
           * [1] http://pep.briangonzalez.org/
           */
          revertIf: function() {
            var currentSlope = $(currentEl).data('slope-val');
            var $target = $('.ppf-graph-target-active');
            var targetSlope = $target.data('slope-val');

            $target.removeClass('ppf-graph-target-active');

            return $target.length < 1 || currentSlope !== targetSlope;
          },

          start: function(event) {
            currentEl = event.target;
          },

          end: function() {
            currentEl = null;
          }
        });
    }

  });

  return Home;
});
