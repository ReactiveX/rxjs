var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldDelayWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).delay(25);
  var newDelayWithImmediateScheduler = RxNew.Observable.of(25).delay(25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old delay with immediate scheduler', function () {
      oldDelayWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new delay with immediate scheduler', function () {
      newDelayWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};