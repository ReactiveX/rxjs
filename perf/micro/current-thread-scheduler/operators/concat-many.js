var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .concatMap(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.currentThread);
    });
  var newConcatMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue)
    .concatMap(function (x) {
      return RxNew.Observable.range(x, 25, RxNew.Scheduler.queue);
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concatMap with current thread scheduler', function () {
      oldConcatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concatMap with current thread scheduler', function () {
      newConcatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};