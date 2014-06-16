define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');
  var _ = require('lodash');
  require('css!./welcome');

  var WelcomeView = Layout.extend({
    className: 'welcome',
    template: require('jade!./welcome'),
    events: {
      'click .tabs li': 'onTabSelect',
      'click .begin': 'begin'
    },
    initialize: function(options) {
      this.title = options.title;
      this.description = options.description;
      this.instructions = options.instructions;
      this.image = options.image;
      this.activeTab = null;

      this.showTab('desc');
    },

    serialize: function() {
      return {
        title: this.title,
        image: this.image,
        description: this.description,
        instructions: this.instructions,
        activeTab: this.activeTab
      };
    },

    onTabSelect: function(event) {
      this.showTab(event.target.dataset.tab);
    },

    showTab: function(tabName) {
      this.activeTab = tabName;
      this.render();
    },

    begin: function() {
      var formData = this.$('form').serializeArray();
      var attributes = _.pluck(formData, 'name');
      var values = _.pluck(formData, 'value');
      var data;

      if (_.unique(attributes).length !== attributes.length) {
        throw new Error(
          'WelcomeView: Contained forms cannot define forms with duplicated ' +
          'input names.'
        );
      }

      // Build a data object whose keys are the form inputs' `name` values and
      // whose values are each corresponding input's `value`.
      data = {};
      _.forEach(_.zip(attributes, values), function(pair) {
        data[pair[0]] = pair[1];
      });

      this.trigger('begin', data);
    }
  });

  return WelcomeView;
});
