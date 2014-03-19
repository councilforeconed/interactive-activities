// @file Provide a selection of activities and create a group for one of them.
define(function(require) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var when = require('when');

  var ActivityView = require('components/activity/activity');

  require('css!./createroom');

  var CreateRoomView = ActivityView.extend({
    title: 'Create Activity Room',
    homeTemplate: require('jade!./createroom'),
    description: require('jade!./description')(),
    instructions: require('jade!./instructions')(),
    events: {
      'submit form': 'submit'
    },

    submit: function(ev) {
      ev.preventDefault();
      // Serialize the form into an object to send as JSON.
      var data = {};
      this.$('form').serializeArray().forEach(function(pair) {
        data[pair.name] = pair.value;
      });
      this._postData(data)
        .then(function(data) {
          Backbone.history.navigate('/room/' + data.id + '/', true);
        }, function(e) {
          // The error is a jQuery XHR object.
          this.serialize.error = e.responseText;
          this.render();
        });
      return false;
    },

    _postData: function(data) {
      return when($.ajax({
        method: 'POST',
        url: '/api/room',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
      }));
    }
  });

  return CreateRoomView;
});
