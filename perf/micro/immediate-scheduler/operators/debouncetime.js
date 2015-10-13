var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var time = [10, 30, 20, 40, 10];

  var oldDebounceTimeWithImmediateScheduler = RxOld.Observable.range(0, 5, RxOld.Scheduler.immediate)
    .flatMap(function (x) { return RxOld.Observable.of(x, RxOld.Scheduler.immediate).delay(time[x]); })
    .debounce(25);
  var newDebounceTimeWithImmediateScheduler = RxNew.Observable.range(0, 5)
    .mergeMap(function (x) { return RxNew.Observable.of(x).delay(time[x]); })
    .debounceTime(25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old debounceTime() with immediate scheduler', function () {
      oldDebounceTimeWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new debounceTime() with immediate scheduler', function () {
      newDebounceTimeWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};