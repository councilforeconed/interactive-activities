'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

var ListenTo = require('../../src/server/listento');
var ProxyFromEmitter = require('../../src/server/proxyfromemitter');

suite('ListenTo', function() {
  var Cls;
  var events;
  var emitter;
  var instance;

  setup(function() {
    Cls = function Cls() {
      ListenTo.call(this, events);
    };
    Cls.prototype = Object.create(ListenTo.prototype);
    Cls.prototype.constructor = Cls;
    Cls.prototype.doSomething = sinon.spy();

    events = { 'somethingHappened': 'doSomething' };

    emitter = new ProxyFromEmitter();
    instance = new Cls();
  });

  test('bindNames', function() {
    var handlers = ListenTo.bindNames(instance, events);

    handlers.somethingHappened();
    assert.ok(instance.doSomething.calledOnce);
    assert.equal(instance.doSomething.thisValues[0], instance);

    handlers = ListenTo.bindNames(instance, ['doSomething']);

    handlers.doSomething();
    assert.ok(instance.doSomething.calledTwice);
    assert.equal(instance.doSomething.thisValues[1], instance);
  });

  test('listenTo', function() {
    instance.listenTo(emitter);

    emitter.emit('somethingHappened');
    assert.ok(instance.doSomething.calledOnce);
    assert.equal(instance.doSomething.thisValues[0], instance);
  });

  test('stopListening', function() {
    instance.listenTo(emitter);

    emitter.emit('somethingHappened');
    assert.ok(instance.doSomething.calledOnce);
    assert.equal(instance.doSomething.thisValues[0], instance);

    instance.stopListening();

    emitter.emit('somethingHappened');
    assert.ok(instance.doSomething.calledOnce);
  });
});
