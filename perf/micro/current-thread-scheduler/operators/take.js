var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTakeWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).take(5);
  var newTakeWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old take with current thread scheduler', function () {
      oldTakeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new take with current thread scheduler', function () {
      newTakeWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};