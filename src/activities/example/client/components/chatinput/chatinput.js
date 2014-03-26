// @file Input view for chat demo.
define(function(require) {
  'use strict';
  var Layout = require('layoutmanager');

  require('css!./chatinput.css');

  var ChatInputView = Layout.extend({
    template: require('jade!./chatinput'),
    events: {
      'submit form': 'chat',
      'keyup [name="message"]': 'chatOnEnter'
    },

    // Fire an event on the view when the user sends a message.
    chat: function(ev) {
      this.trigger('chat', {
        nickname: this.$('[name="nickname"]').val(),
        message: this.$('[name="message"]').val()
      });
      this.$('[name="message"]').val('');
      ev.preventDefault();
      return false;
    },

    chatOnEnter: function(ev) {
      if (ev.keyCode === 13) {
        return this.chat(ev);
      }
    }
  });

  return ChatInputView;
});
