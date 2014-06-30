define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var Player = require('./player');

  var PlayerCollection = Backbone.Collection.extend({
    model: Player
  });

  return PlayerCollection;
});
