var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldRepeatWithCurrentThreadScheduler = RxOld.Observable.of(25, RxOld.Scheduler.currentThread)
    .repeat(5, RxOld.Scheduler.currentThread);
  var newRepeatWithCurrentThreadScheduler = RxNew.Observable.of(25, RxNew.Scheduler.immediate)
    .repeat(5, RxNew.Scheduler.immediate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old repeat with current thread scheduler', function () {
        oldRepeatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
      })
      .add('new repeat with current thread scheduler', function () {
        newRepeatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
      });
};