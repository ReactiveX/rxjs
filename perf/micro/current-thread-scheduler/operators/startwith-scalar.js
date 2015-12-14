var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldStartWithWithCurrentThreadScheduler = RxOld.Observable.of(25, RxOld.Scheduler.currentThread)
    .startWith(RxOld.Scheduler.currentThread, 5);
  var newStartWithWithCurrentThreadScheduler = RxNew.Observable.of(25, RxNew.Scheduler.queue)
    .startWith(5, RxNew.Scheduler.queue);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old startWith(scalar) with current thread scheduler', function () {
      oldStartWithWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new startWith(scalar) with current thread scheduler', function () {
      newStartWithWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
