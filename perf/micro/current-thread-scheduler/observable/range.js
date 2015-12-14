var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function range(suite) {
  // add tests

  var oldRangeWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread);
  var newRangeWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old range with current thread scheduler', function () {
      oldRangeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new range with current thread scheduler', function () {
      newRangeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};