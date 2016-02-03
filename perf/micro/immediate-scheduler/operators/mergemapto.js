var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMap(RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate));
  var newMergeMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .mergeMapTo(RxNew.Observable.range(0, 25));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeMap (Observable) with immediate scheduler', function () {
      oldMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeMap (Observable) with immediate scheduler', function () {
      newMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};