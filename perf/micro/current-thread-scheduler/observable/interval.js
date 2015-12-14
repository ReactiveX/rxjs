var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function interval(suite) {
  var oldIntervalWithCurrentThreadScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.currentThread).take(5);
  var newIntervalWithCurrentThreadScheduler = RxNew.Observable.interval(25, RxNew.Scheduler.queue).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old interval with current thread scheduler', function () {
      oldIntervalWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new interval with current thread scheduler', function () {
      newIntervalWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};