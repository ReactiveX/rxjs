var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(acc, x) {
    return x + x;
  }

  var oldScanWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).scan(add);
  var newScanWithImmediateScheduler = RxNew.Observable.range(0, 25).scan(add);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old scan with immediate scheduler', function () {
      oldScanWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new scan with immediate scheduler', function () {
      newScanWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
