var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(acc, x) {
    return x + x;
  }

  var oldScanScalarWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).scan(add);
  var newScanScalarWithImmediateScheduler = RxNew.Observable.of(25).scan(add);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old scalar observable scan with immediate scheduler with no seed', function () {
      oldScanScalarWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new scalar observable scan with immediate scheduler with no seed', function () {
      newScanScalarWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};