var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function timer(suite) {
  var oldTimerWithCurrentThreadScheduler = RxOld.Observable.timer(25, RxOld.Scheduler.currentThread).take(5);
  var newTimerWithCurrentThreadScheduler = RxNew.Observable.timer(25, RxNew.Scheduler.queue).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old timer with current thread scheduler', function () {
      oldTimerWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new timer with current thread scheduler', function () {
      newTimerWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};