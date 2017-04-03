var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldBufferCountWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).bufferWithCount(5, 3);
  var newBufferCountWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue).bufferCount(5, 3);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old bufferCount with current thread scheduler', function () {
      oldBufferCountWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new bufferCount with current thread scheduler', function () {
      newBufferCountWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};