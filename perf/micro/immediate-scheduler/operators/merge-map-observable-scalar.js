var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMap(RxOld.Observable.return(0, RxOld.Scheduler.immediate));
  var newMergeMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .mergeMapTo(RxNew.Observable.of(0));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeMap (scalar Observable) with immediate scheduler', function () {
      oldMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeMap (scalar Observable) with immediate scheduler', function () {
      newMergeMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};