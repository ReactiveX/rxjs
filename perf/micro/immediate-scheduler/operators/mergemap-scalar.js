var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMap(function (x) {
      return RxOld.Observable.return(x, RxOld.Scheduler.immediate);
    });
  var newMergeMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .mergeMap(function (x) {
      return RxNew.Observable.of(x);
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeMap (scalar) with immediate scheduler', function () {
      oldMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeMap (scalar) with immediate scheduler', function () {
      newMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};