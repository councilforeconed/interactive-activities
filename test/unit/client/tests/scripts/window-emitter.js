define(function(require) {
  'use strict';
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var WindowEmitter = require('scripts/window-emitter');

  suite('WindowEmitter', function() {
    var listener;
    setup(function() {
      listener = _.extend({}, Backbone.Events);
    });
    teardown(function() {
      listener.stopListening();
    });

    suite('scroll event', function() {
      test('triggering', function(done) {
        listener.listenTo(WindowEmitter, 'scroll', function(event) {
          assert.ok(event, 'event triggered with an event object');
          done();
        });

        $(window).trigger('scroll');
      });

      test('throttling', function(done) {
        var callCount = 0;
        listener.listenTo(WindowEmitter, 'scroll', function() {
          callCount++;
          assert.equal(
            callCount,
            1,
            'The event handler should be invoked exactly one time.'
          );

          setTimeout(done, 0);
        });

        $(window).trigger('scroll');
        $(window).trigger('scroll');
      });

      test('unbinding', function(done) {
        listener.listenTo(WindowEmitter, 'scroll', function() {
          done(new Error('The event handler was not unbound as expected.'));
        });

        listener.stopListening();
        listener.listenTo(WindowEmitter, 'scroll', function() {
          done();
        });

        $(window).trigger('scroll');
      });
    });

    suite('resize event', function() {
      test('triggering', function(done) {
        listener.listenTo(WindowEmitter, 'resize', function(event) {
          assert.ok(event, 'event triggered with an event object');
          done();
        });

        $(window).trigger('resize');
      });

      test('throttling', function(done) {
        var callCount = 0;
        listener.listenTo(WindowEmitter, 'resize', function() {
          callCount++;
          assert.equal(
            callCount,
            1,
            'The event handler should be invoked exactly one time.'
          );

          setTimeout(done, 0);
        });

        $(window).trigger('resize');
        $(window).trigger('resize');
      });

      test('unbinding', function(done) {
        listener.listenTo(WindowEmitter, 'resize', function() {
          done(new Error('The event handler was not unbound as expected.'));
        });

        listener.stopListening();
        listener.listenTo(WindowEmitter, 'resize', function() {
          done();
        });

        $(window).trigger('resize');
      });
    });
  });
});
