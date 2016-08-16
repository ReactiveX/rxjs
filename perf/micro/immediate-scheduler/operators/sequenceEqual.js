var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var _old = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .sequenceEqual(RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate));
  var _new = RxNew.Observable.range(0, 25).sequenceEqual(RxNew.Observable.range(0, 25));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old sequenceEqual with immediate scheduler', function () {
      _old.subscribe(_next, _error, _complete);
    })
    .add('new sequenceEqual with immediate scheduler', function () {
      _new.subscribe(_next, _error, _complete);
    });
};
