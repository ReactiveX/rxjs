var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var resultSelector = function (x, y, ix, iy) { return x + y + ix + iy; };
  var oldSwitchMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMapLatest(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
    }, resultSelector);
  var newSwitchMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .switchMap(function (x) {
      return RxNew.Observable.range(x, 25);
    }, resultSelector);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchMap with resultSelector and immediate scheduler', function () {
      oldSwitchMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchMap with resultSelector and immediate scheduler', function () {
      newSwitchMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
