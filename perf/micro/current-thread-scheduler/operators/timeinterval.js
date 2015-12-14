var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTimeIntervalWithCurrentThreadScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.currentThread)
    .take(5).timeInterval(RxOld.Scheduler.currentThread);
  var newTimeIntervalWithCurrentThreadScheduler = RxNew.Observable.interval(25, RxNew.Scheduler.queue)
    .take(5).timeInterval(RxNew.Scheduler.queue);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old timeInterval() with current thread scheduler', function () {
      oldTimeIntervalWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new timeInterval() with current thread scheduler', function () {
      newTimeIntervalWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};