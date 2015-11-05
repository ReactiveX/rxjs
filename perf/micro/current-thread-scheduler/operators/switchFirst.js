var RxOld = require('rx');
var RxNew = require('../../../../index');

var source = Array.apply(null, { length: 25 });

module.exports = function (suite) {
  var oldMergeAllWithCurrentThreadScheduler = RxOld.Observable.fromArray(
    source.map(function () { return RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread); }),
    RxOld.Scheduler.currentThread
  )
    .switchFirst();
  var newMergeAllWithCurrentThreadScheduler = RxNew.Observable.fromArray(
    source.map(function () { return RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate); }),
    RxNew.Scheduler.immediate
  )
    .switchFirst();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchFirst with current thread scheduler', function () {
      oldMergeAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchFirst with current thread scheduler', function () {
      newMergeAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
