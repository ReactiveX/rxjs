var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeWithCurrentThreadScheduler = RxOld.Observable.range(0, 250, RxOld.Scheduler.currentThread)
    .merge(RxOld.Observable.range(0, 250, RxOld.Scheduler.currentThread));
  var newMergeWithCurrentThreadScheduler = RxNew.Observable.range(0, 250, RxNew.Scheduler.queue)
    .merge(RxNew.Observable.range(0, 250, RxNew.Scheduler.queue));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old merge (proto) with current thread scheduler', function () {
      oldMergeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new merge (proto) with current thread scheduler', function () {
      newMergeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};