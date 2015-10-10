var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeAllWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .map(RxOld.Observable.range(0, 25), RxOld.Scheduler.currentThread)
    .mergeAll();
  var newMergeAllWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate)
    .map(RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate))
    .mergeAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeAll with current thread scheduler', function () {
      oldMergeAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeAll with current thread scheduler', function () {
      newMergeAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};