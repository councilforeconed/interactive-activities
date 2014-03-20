// @file Query user for group to join. Likely to be used as a modal's content.
define(function(require) {
  'use strict';
  var $ = require('jquery');
  var _ = require('lodash');
  var Backbone = require('backbone');
  var Layout = require('layoutmanager');
  var when = require('when');
  require('css!./joingroup');

  var JoinGroupView = Layout.extend({
    className: 'welcome',
    template: require('jade!./joingroup'),
    events: {
      'click .joinGroup': 'join',
      'submit form': 'join'
    },
    serialize: function() {
      return {
        error: this.error
      };
    },

    // Take the user's group name, check that it is for the desired activity
    // and redirect to it.
    join: function(event) {
      var formData = this.$('form').serializeArray();
      var attributes = _.pluck(formData, 'name');
      var values = _.pluck(formData, 'value');
      var data;

      if (_.unique(attributes).length !== attributes.length) {
        throw new Error(
          'JoinGroupView: Contained forms cannot define forms with ' +
          'duplicated input names.'
        );
      }

      // Build a data object whose keys are the form inputs' `name` values and
      // whose values are each corresponding input's `value`.
      data = {};
      _.forEach(_.zip(attributes, values), function(pair) {
        data[pair[0]] = pair[1];
      });

      var self = this;
      var expectActivity = this.activity;
      var groupName = data.group;

      when($.get('/api/group/' + groupName))
        // Reconfigure a server error into an error object.
        .catch(function(e) {
          if (/not found/.test(e.responseText)) {
            throw new Error(
              'A group by the name, ' + groupName + ', does not exist.'
            );
          }
          throw new Error('Received unknown error. \n' + e.responseText);
        })
        // Throw an error if the given group is for a different activity.
        .then(function(groupData) {
          if (groupData.activity !== expectActivity) {
            throw new Error(
              groupName + ' is a group for a different activity. It is a group for the ' + groupData.activity + ' activity.'
            );
          }
          return groupData;
        })
        // All is good, navigate to the group.
        .then(function() {
          Backbone.history.navigate(
            '/activity/' + expectActivity  + '/group/' + groupName + '/',
            true
          );
        })
        // Something went wrong, present the error.
        .catch(function(e) {
          self.error = e.message;
          self.render();
        });

      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  return JoinGroupView;
});
