var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTimeIntervalWithImmediateScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.immediate)
    .take(5).timeInterval(RxOld.Scheduler.immediate);
  var newTimeIntervalWithImmediateScheduler = RxNew.Observable.interval(25)
    .take(5).timeInterval();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old timeInterval() with immediate scheduler', function () {
      oldTimeIntervalWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new timeInterval() with immediate scheduler', function () {
      newTimeIntervalWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};