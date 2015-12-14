var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldDefaultIfEmptyWithCurrentThreadScheduler = RxOld.Observable.empty(RxOld.Scheduler.currentThread).defaultIfEmpty(25);
  var newDefaultIfEmptyWithCurrentThreadScheduler = RxNew.Observable.empty(RxNew.Scheduler.queue).defaultIfEmpty(25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old defaultIfEmpty with current thread scheduler', function () {
      oldDefaultIfEmptyWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new defaultIfEmpty with current thread scheduler', function () {
      newDefaultIfEmptyWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};