var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var time = [10, 30, 20, 40, 10];

  var oldDebounceWithImmediateScheduler = RxOld.Observable.range(0, 5, RxOld.Scheduler.immediate)
    .flatMap(function (x) { return RxOld.Observable.of(x, RxOld.Scheduler.immediate).delay(time[x]); })
    .debounce(function (x) { return RxOld.Observable.timer(25); });
  var newDebounceWithImmediateScheduler = RxNew.Observable.range(0, 5)
    .mergeMap(function (x) { return RxNew.Observable.of(x).delay(time[x]); })
    .debounce(function (x) { return RxNew.Observable.timer(25); });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old debounce() with immediate scheduler', function () {
      oldDebounceWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new debounce() with immediate scheduler', function () {
      newDebounceWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};