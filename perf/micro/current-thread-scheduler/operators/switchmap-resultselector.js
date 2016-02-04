var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var resultSelector = function (x, y, ix, iy) { return x + y + ix + iy; };
  var oldSwitchMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .flatMapLatest(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.currentThread);
    }, resultSelector);
  var newSwitchMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue)
    .switchMap(function (x) {
      return RxNew.Observable.range(x, 25, RxNew.Scheduler.queue);
    }, resultSelector);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchMap with resultSelector and current thread scheduler', function () {
      oldSwitchMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchMap with resultSelector and current thread scheduler', function () {
      newSwitchMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
