var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value) { return value < 48; };
  var oldTakeWhileWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).takeWhile(predicate);
  var newTakeWhileWithImmediateScheduler = RxNew.Observable.range(0, 50).takeWhile(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old takeWhile with immediate scheduler', function () {
      oldTakeWhileWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new takeWhile with immediate scheduler', function () {
      newTakeWhileWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
