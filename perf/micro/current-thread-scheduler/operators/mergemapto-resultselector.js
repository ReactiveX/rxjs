var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var resultSelector = function (x, y, ix, iy) { return x + y + ix + iy; };
  var oldMergeMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .flatMap(RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread), resultSelector);
  var newMergeMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue)
    .mergeMapTo(RxNew.Observable.range(0, 25, RxNew.Scheduler.queue), resultSelector);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeMap (Observable) with resultSelector and currentThread scheduler', function () {
      oldMergeMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeMap (Observable) with resultSelector and currentThread scheduler', function () {
      newMergeMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
