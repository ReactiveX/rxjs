var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldWindowCountWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).windowWithCount(5);
  var newWindowCountWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue).windowCount(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old windowCount with current thread scheduler', function () {
      oldWindowCountWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new windowCount with current thread scheduler', function () {
      newWindowCountWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};