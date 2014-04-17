'use strict';

module.exports = function(method, model) {
  var prefix = this.prefix || '';
  var room = this.room;

  if (!prefix && this.collection) {
    prefix = this.collection.prefix;
  }
  if (!room && this.collection) {
    room = this.collection.room;
  }

  if (method === 'read') {
    throw new Error(
      'Server cannot read from the client because that would be weird.'
    );
  }

  room.messageMembers(prefix + '/' + method, model.toJSON());
};
