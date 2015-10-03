var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function interval(suite) {
  var oldIntervalWithImmediateScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.immediate).take(5);
  var newIntervalWithImmediateScheduler = RxNew.Observable.interval(25).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old interval with immediate scheduler', function () {
      oldIntervalWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new interval with immediate scheduler', function () {
      newIntervalWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};