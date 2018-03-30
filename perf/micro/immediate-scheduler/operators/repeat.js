var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldRepeatWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).repeat(5);
  var newRepeatWithImmediateScheduler = RxNew.Observable.range(0, 25).repeat(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old repeat() with immediate scheduler', function () {
      oldRepeatWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new repeat() with immediate scheduler', function () {
      newRepeatWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};