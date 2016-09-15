var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToSetWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).toSet();
  var newToSetWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue).toSet();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old toSet with current thread scheduler', function () {
      oldToSetWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new toSet with current thread scheduler', function () {
      newToSetWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
