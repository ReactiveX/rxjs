var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTakeWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).take(5);
  var newTakeWithImmediateScheduler = RxNew.Observable.range(0, 50).take(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old take with immediate scheduler', function () {
      oldTakeWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new take with immediate scheduler', function () {
      newTakeWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};