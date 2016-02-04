var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var resultSelector = function (x, y, ix, iy) { return x + y + ix + iy; };
  var oldSwitchMapToWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMapLatest(RxOld.Observable.range(0, 10, RxOld.Scheduler.immediate), resultSelector);
  var newSwitchMapToWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .switchMapTo(RxNew.Observable.range(0, 10), resultSelector);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchMapTo with resultSelector and immediate scheduler', function () {
      oldSwitchMapToWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchMapTo with resultSelector and immediate scheduler', function () {
      newSwitchMapToWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
