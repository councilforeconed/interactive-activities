define(function(require) {
  'use strict';
  var Txn = require('../../shared/txn');
  var cloak = require('cloak');
  var when = require('when');

  var ClientTxn = Txn.extend({
    sync: function() {
      var dfd = when.defer();
      var sendData = this.toJSON();

      cloak.message('trade', sendData);

      this.once('reject', function(receiveData) {
        if (!this.fuzzyMatch(receiveData)) {
          return;
        }
        dfd.reject();
      });
      this.once('accept', function(receiveData) {
        if (!this.fuzzyMatch(receiveData)) {
          return;
        }
        dfd.resolve();
      });

      return dfd.promise;
    }
  });

  return ClientTxn;
});
