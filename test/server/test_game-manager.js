'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var cloak = require('cloak');
var CloakRoom = require('cloak/room');

var GameManager = require('../../src/server/game-manager');

var CRUDManager = require('../../src/server/crudmanager');
var MemoryStore = require('../../src/server/storememory');
var RoomDataCollector = require('../../src/server/roomdatacollector');

suite('GameManager', function() {

  var gameManager;
  var TestGame;
  var testGames;
  var fakeUser, fakeRoom;

  suiteSetup(function() {
    cloak.configure({ serverEvents: {} });
    cloak.run();
  });

  setup(function() {
    this.sandbox = sinon.sandbox.create();
    TestGame = function() {
      assert.instanceOf(
        this,
        TestGame,
        'Game constructor is invoked with `new`'
      );
      this._args = arguments;
      testGames.push(this);
    };
    TestGame.messageHandlers = {
      messageName: 'handleMessage'
    };
    TestGame.prototype.join = this.sandbox.spy();
    TestGame.prototype.leave = this.sandbox.spy();
    TestGame.prototype.handleMessage = this.sandbox.spy();

    var groupManager = new CRUDManager({
      name: 'group',
      store: new MemoryStore()
    });
    var dataCollector = new RoomDataCollector(new CRUDManager({
      name: 'data',
      store : new MemoryStore()
    }));
    gameManager = new GameManager({
      dataCollector: dataCollector,
      groupManager: groupManager,
      GameCtor: TestGame
    });

    testGames = [];

    this.sandbox.stub(CloakRoom.prototype, 'addMember');
    fakeRoom = {
      name: 'my-group'
    };
    fakeUser = {
      getRoom: function() {
        return fakeRoom;
      }
    };

    return groupManager.create(fakeRoom.name, { room: fakeRoom.name });
  });

  teardown(function() {
    this.sandbox.restore();
  });

  suite('room initialization', function() {
    test('creates a single Game instance for each new group', function() {
      assert.equal(testGames.length, 1);
    });
    test('provides the Game instance with necessary options', function() {
      var args = testGames[0]._args;

      assert.equal(args[0].cloakRoom.name, fakeRoom.name);
      assert.isFunction(args[0].report);
    });
  });

  suite('generic messages', function() {
    var handlers;

    setup(function() {
      handlers = gameManager.cloakMsgsMsgHandlers();
    });

    suite('joinRoom', function() {
      test('existing room', function() {
        handlers.joinRoom('my-group', fakeUser);

        sinon.assert.calledWith(TestGame.prototype.join, fakeUser);
        sinon.assert.calledOn(TestGame.prototype.join, testGames[0]);
        sinon.assert.calledWith(CloakRoom.prototype.addMember, fakeUser);
      });
      test('non-existent room', function() {
        handlers.joinRoom('some-other-group', fakeUser);

        sinon.assert.notCalled(
          TestGame.prototype.join,
          'Does not invoke the Game\'s `join` method.'
        );
        sinon.assert.notCalled(
          CloakRoom.prototype.addMember,
          'Does not attempt to add the user to a Cloak room'
        );
      });
    });

    suite('custom messages', function() {
      test('generates a handler for the specified message topic', function() {
        assert.isFunction(handlers.messageName);
      });
      test('invokes the correct game instance\'s method', function() {
        var data = {};
        handlers.messageName(data, fakeUser);

        sinon.assert.calledWith(
          TestGame.prototype.handleMessage,
          data, fakeUser
        );
        sinon.assert.calledOn(TestGame.prototype.handleMessage, testGames[0]);
      });
    });
  });

  suite('Cloak room messages', function() {
    var handlers;

    setup(function() {
      handlers = gameManager.cloakRoomMsgHandlers();
    });

    suite('memberLeaves', function() {
      test('existing room', function() {
        handlers.memberLeaves.call(fakeRoom, fakeUser);

        sinon.assert.calledWith(TestGame.prototype.leave, fakeUser);
        sinon.assert.calledOn(TestGame.prototype.leave, testGames[0]);
      });
      test('non-existent room', function() {
        handlers.memberLeaves.call({ name: 'non-existent' }, fakeUser);

        sinon.assert.notCalled(
          TestGame.prototype.leave,
          'Does not invoke the Game\'s `leave` method'
        );
      });
    });
  });
});
