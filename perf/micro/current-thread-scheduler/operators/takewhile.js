var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value) { return value < 48; };
  var oldTakeWhileWithCurrentThreadScheduler =
    RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread).takeWhile(predicate);
  var newTakeWhileWithCurrentThreadScheduler =
    RxNew.Observable.range(0, 50, RxNew.Scheduler.queue).takeWhile(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old takeWhile with current thread scheduler', function () {
      oldTakeWhileWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new takeWhile with current thread scheduler', function () {
      newTakeWhileWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
