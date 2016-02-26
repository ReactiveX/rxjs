var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var oldObservableWithCurrentThreadScheduler = RxOld.Observable.empty(RxOld.Scheduler.currentThread);
  var newObservableWithCurrentThreadScheduler = RxNew.Observable.empty(RxNew.Scheduler.queue);

  function oldFactory() { return oldObservableWithCurrentThreadScheduler; }
  function newFactory() { return newObservableWithCurrentThreadScheduler; }

  var oldDeferWithCurrentThreadScheduler = RxOld.Observable.defer(oldFactory);
  var newDeferWithCurrentThreadScheduler = RxNew.Observable.defer(newFactory);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old defer with current thread scheduler', function () {
      oldDeferWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new defer with current thread scheduler', function () {
      newDeferWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};