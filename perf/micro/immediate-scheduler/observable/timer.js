var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function timer(suite) {
  var oldTimerWithImmediateScheduler = RxOld.Observable.timer(25, RxOld.Scheduler.immediate).take(5);
  var newTimerWithImmediateScheduler = RxNew.Observable.timer(25).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old timer with immediate scheduler', function () {
      oldTimerWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new timer with immediate scheduler', function () {
      newTimerWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};