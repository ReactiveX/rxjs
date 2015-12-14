var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSkipWithCurrentThreadScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread).skip(25);
  var newSkipWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.queue).skip(25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skip with current thread scheduler', function () {
      oldSkipWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skip with current thread scheduler', function () {
      newSkipWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};