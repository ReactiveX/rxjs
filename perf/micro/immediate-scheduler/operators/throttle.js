var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  // v4's `throttle()` does not accept a duration selector.
  // So this test is just a sample for each revisions of RxNew.
  var oldThrottleWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .throttle(1);
  var newThrottleWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .throttle(function () { return RxNew.Observable.of(0); });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old throttle() with immediate scheduler', function () {
      oldThrottleWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new throttle() with immediate scheduler', function () {
      newThrottleWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};