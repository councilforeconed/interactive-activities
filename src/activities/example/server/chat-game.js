'use strict';

module.exports = ChatGame;

function ChatGame(options) {
  this.report = options.report;
}

ChatGame.messageHandlers = {
  chat: 'chat'
};

ChatGame.prototype.join = function(user) {
  this.report({
    type: 'joinRoom',
    user: user.id
  });
};

ChatGame.prototype.leave = function() {};

ChatGame.prototype.chat = function(obj, user) {
  user.getRoom().messageMembers('chat', obj);
  this.report({
    type: 'chat',
    user: user.id
  });
};
