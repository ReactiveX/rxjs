var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function range(suite) {
  // add tests

  var oldRangeWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate);
  var newRangeWithImmediateScheduler = RxNew.Observable.range(0, 25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old range with immediate scheduler', function () {
      oldRangeWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new range with immediate scheduler', function () {
      newRangeWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};