var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(acc, x) {
    return x + x;
  }
  var oldScanWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).scan(add);
  var newScanWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).scan(add);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old scan with current thread scheduler', function () {
      oldScanWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new scan with current thread scheduler', function () {
      newScanWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};