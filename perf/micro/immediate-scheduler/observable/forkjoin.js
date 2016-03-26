var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function forkJoin(suite) {
  var oldForkJoinWithImmediateScheduler = RxOld.Observable.forkJoin(
    RxOld.Observable.of(25, RxOld.Scheduler.immediate),
    RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate),
    RxOld.Observable.from([1, 2, 3, 4, 5], null, this, RxOld.Scheduler.immediate));

  var newForkJoinWithImmediateScheduler = RxNew.Observable.forkJoin(
    RxNew.Observable.of(25),
    RxNew.Observable.range(0,25),
    RxNew.Observable.from([1, 2, 3, 4, 5]));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }

  return suite
    .add('old forkJoin() with immediate scheduler', function () {
      oldForkJoinWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new forkJoin() with immediate scheduler', function () {
      newForkJoinWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};