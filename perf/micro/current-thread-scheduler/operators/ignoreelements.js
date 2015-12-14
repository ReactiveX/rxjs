var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldIgnoreElementsWithCurrentThreadScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread).ignoreElements();
  var newIgnoreElementsWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.queue).ignoreElements();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old ignoreElements with current thread scheduler', function () {
      oldIgnoreElementsWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new ignoreElements with current thread scheduler', function () {
      newIgnoreElementsWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
