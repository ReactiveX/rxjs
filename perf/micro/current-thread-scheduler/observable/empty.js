var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var oldEmptyWithCurrentThreadScheduler = RxOld.Observable.empty(RxOld.Scheduler.currentThread);
  var newEmptyWithCurrentThreadScheduler = RxNew.Observable.empty(RxNew.Scheduler.queue);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old empty with current thread scheduler', function () {
      oldEmptyWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new empty with current thread scheduler', function () {
      newEmptyWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};