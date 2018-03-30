var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMergeWithImmediateScheduler = RxOld.Observable.range(0, 250, RxOld.Scheduler.immediate)
    .merge(RxOld.Observable.range(0, 250, RxOld.Scheduler.immediate));
  var newMergeWithImmediateScheduler = RxNew.Observable.range(0, 250)
    .merge(RxNew.Observable.range(0, 250));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old merge (proto) with immediate scheduler', function () {
      oldMergeWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new merge (proto) with immediate scheduler', function () {
      newMergeWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};