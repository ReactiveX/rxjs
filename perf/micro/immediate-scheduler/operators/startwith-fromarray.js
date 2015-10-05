var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldStartWithWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate)
    .startWith(RxOld.Scheduler.immediate, 5, 5, 5);
  var newStartWithWithImmediateScheduler = RxNew.Observable.of(25)
    .startWith(5, 5, 5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old startWith(fromArray) with immediate scheduler', function () {
      oldStartWithWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new startWith(fromArray) with immediate scheduler', function () {
      newStartWithWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};