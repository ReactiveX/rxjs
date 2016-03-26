var RxOld = require('rx');
var RxNew = require('../../../../index');

var source = Array.apply(null, { length: 25 });

module.exports = function (suite) {
  var oldConcatAllWithCurrentThreadScheduler = RxOld.Observable.from(
    source.map(function () { return RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread); }),
    null,
    this,
    RxOld.Scheduler.currentThread
  )
    .concatAll();
  var newConcatAllWithCurrentThreadScheduler = RxNew.Observable.from(
    source.map(function () { return RxNew.Observable.range(0, 25, RxNew.Scheduler.queue); }),
    RxNew.Scheduler.queue
  )
    .concatAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concatAll with current thread scheduler', function () {
      oldConcatAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concatAll with current thread scheduler', function () {
      newConcatAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
