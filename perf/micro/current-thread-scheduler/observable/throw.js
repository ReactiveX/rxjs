var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function _throw(suite) {
  var oldThrowWithCurrentThreadScheduler = RxOld.Observable.throw(new Error('error'), RxOld.Scheduler.currentThread);
  var newThrowWithCurrentThreadScheduler = RxNew.Observable.throw(new Error('error'), RxNew.Scheduler.queue);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old throw with current thread scheduler', function () {
      oldThrowWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new throw with current thread scheduler', function () {
      newThrowWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};