var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldTakeLastWithImmediateScheduler = RxOld.Observable.range(0, 500, RxOld.Scheduler.currentThread).takeLast(50);
  var newTakeLastWithImmediateScheduler = RxNew.Observable.range(0, 500, RxNew.Scheduler.queue).takeLast(50);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old take with immediate scheduler', function () {
      oldTakeLastWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new take with immediate scheduler', function () {
      newTakeLastWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
