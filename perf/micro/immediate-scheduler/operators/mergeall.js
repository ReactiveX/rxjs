var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeAllWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .map(RxOld.Observable.range(0, 25), RxOld.Scheduler.immediate)
    .mergeAll();
  var newMergeAllWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .mapTo(RxNew.Observable.range(0, 25))
    .mergeAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old mergeAll with immediate scheduler', function () {
      oldMergeAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mergeAll with immediate scheduler', function () {
      newMergeAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
