var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToArrayWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).toArray();
  var newToArrayWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue).toArray();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old toArray with current thread scheduler', function () {
      oldToArrayWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new toArray with current thread scheduler', function () {
      newToArrayWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};