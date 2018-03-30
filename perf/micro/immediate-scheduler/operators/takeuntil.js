var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTakeUntilWithImmediateScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.immediate)
    .take(3).takeUntil(RxOld.Observable.timer(60, RxOld.Scheduler.immediate));
  var newTakeUntilWithImmediateScheduler = RxNew.Observable.interval(25)
    .take(3).takeUntil(RxNew.Observable.timer(60));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old takeUntil with immediate scheduler', function () {
      oldTakeUntilWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new takeUntil with immediate scheduler', function () {
      newTakeUntilWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};