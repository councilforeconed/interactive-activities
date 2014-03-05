define(function(require) {
  'use strict';
  var Layout = require('scripts/layout');

  suite('Layout', function() {
    suite('#render', function() {
      test('chainable', function() {
        var layout = new Layout();
        assert.equal(layout.render(), layout);
      });
      test('expanding template', function() {
        var layout = new Layout({
          template: function() {
            return 'template <b>markup</b>';
          }
        });

        layout.render();

        assert.equal(layout.$el.html(), 'template <b>markup</b>');
      });
      test('serialization', function(done) {
        var data = {};
        var layout = new Layout({
          template: function(serialized) {
            assert.equal(serialized, data);
            done();
          },
          serialize: function() {
            return data;
          }
        });

        layout.render();
      });
    });

    suite('#destroy', function() {
      test('emptying container', function() {
        var layout = new Layout();
        layout.$el.html('test');

        layout.destroy();

        assert.equal(layout.$el.html(), '');
      });
      test('invokes "preDestroy" hook before emptying', function(done) {
        var layout = new Layout({
          preDestroy: function() {
            assert.equal(this.$el.html(), 'test markup');
            done();
          }
        });

        layout.$el.html('test markup');
        layout.destroy();
      });
    });
  });
});
