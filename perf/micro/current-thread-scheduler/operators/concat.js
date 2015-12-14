var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .concat(RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread));
  var newConcatWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue)
    .concat(RxNew.Observable.range(0, 25, RxNew.Scheduler.queue));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concat with current thread scheduler', function () {
      oldConcatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concat with current thread scheduler', function () {
      newConcatWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};