var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function of(suite) {
  var args = [];
  for (var i = 0; i < 25; i++) {
    args.push(i);
  }

  var oldOfWithImmediateScheduler = RxOld.Observable.of.apply(null, args);
  var newOfWithImmediateScheduler = RxNew.Observable.of.apply(null, args);

  function _next(x) { }
  function _error(e) { }

  // add tests
  return suite
    .add('old of called plain', {
      defer: true,
      fn: function (deferred) {
        oldOfWithImmediateScheduler.subscribe(_next, _error, function () {
          deferred.resolve();
        });
      }
    })
    .add('new of called plain', {
      defer: true,
      fn: function (deferred) {
        newOfWithImmediateScheduler.subscribe(_next, _error, function () {
          deferred.resolve();
        });
      }
    });
};