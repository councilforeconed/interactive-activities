// @file Manage a room of an activity. This will list information on the
// room's groups.
define(function(require) {
  'use strict';

  var $ = require('jquery');
  var when = require('when');

  var ActivityView = require('components/activity/activity');

  require('css!./manageroom');

  var ManageRoomView = ActivityView.extend({
    homeTemplate: require('jade!./manageroom'),
    description: require('jade!./description')(),
    instructions: require('jade!./instructions')(),
    events: {
      'click .add-group': 'addGroup',
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    beforeRender: function() {
      this.title = 'Manage Room: ' + this.model.get('id');
    },

    // Add a group and re-render on success.
    addGroup: function() {
      var self = this;
      var ajaxPut = $.ajax({
        method: 'PUT',
        url: '/api/room/' + self.model.get('id'),
        data: JSON.stringify({ addGroups: 1 }),
        contentType: 'application/json',
        dataType: 'json'
      });
      when(ajaxPut)
        // Transform a server error into an error object.
        .catch(function(e) {
          throw new Error(
            'An error occurred on the server. \n' + e.responseText
          );
        })
        // Render the json returned by the server.
        .then(function(data) {
          // Remove any previously reported error.
          data.error = undefined;
          self.model.set(data);
        })
        // An error occured, present it.
        .catch(function(e) {
          self.model.set('error', e.message);
        });
    }
  });

  return ManageRoomView;
});
