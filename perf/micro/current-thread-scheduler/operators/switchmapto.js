var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSwitchMapToWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .flatMapLatest(RxOld.Observable.range(0, 10, RxOld.Scheduler.currentThread));
  var newSwitchMapToWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue)
    .switchMapTo(RxNew.Observable.range(0, 10, RxNew.Scheduler.queue));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchMapTo with current thread scheduler', function () {
      oldSwitchMapToWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchMapTo with current thread scheduler', function () {
      newSwitchMapToWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
