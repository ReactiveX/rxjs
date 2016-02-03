var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var resultSelector = function (x, y, ix, iy) { return x + y + ix + iy; };
  var oldMergeMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMap(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
    }, resultSelector);
  var newMergeMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .mergeMap(function (x) {
      return RxNew.Observable.range(x, 25);
    }, resultSelector);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeMap with resultSelector and immediate scheduler', function () {
      oldMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeMap with resultSelector and immediate scheduler', function () {
      newMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
