var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value) { return value < 25; };
  var oldSkipWhileWithCurrentThreadScheduler =
    RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread).skipWhile(predicate);
  var newSkipWhileWithCurrentThreadScheduler =
    RxNew.Observable.range(0, 50, RxNew.Scheduler.queue).skipWhile(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skipWhile with current thread scheduler', function () {
      oldSkipWhileWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skipWhile with current thread scheduler', function () {
      newSkipWhileWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
