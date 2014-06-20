define(function(require) {
  'use strict';

  var $ = require('jquery');
  var Layout = require('layoutmanager');

  var formatters = require('scripts/formatters');
  var sliceTemplate = require('jade!./slice');
  require('css!./bill');

  var BillView = Layout.extend({
    template: require('jade!./bill'),

    initialize: function() {
      this.listenTo(this.model.rounds, 'setRounds', this.insertSlices);
    },

    insertSlices: function() {
      var total = this.model.total;
      var slices = document.createDocumentFragment();

      this.model.rounds.each(function(round) {
        var context = round.toJSON();
        var $slice, markup;

        context.formatters = formatters;
        markup = sliceTemplate(context);

        $slice = $(markup).css({
          left: (100 * (total - round.get('deposit')) / total) + '%',
          width: (100 * round.get('reserves') / total) + '%',
          height: '100%',
          top: 0
        });

        slices.appendChild($slice[0]);
      });

      this.$('.reserved-overlays').empty().append(slices);
    }
  });

  return BillView;
});
