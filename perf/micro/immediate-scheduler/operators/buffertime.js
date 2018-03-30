var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldBufferWithImmediateScheduler =
    RxOld.Observable.interval(25, RxOld.Scheduler.immediate)
      .bufferWithTime(60, RxOld.Scheduler.immediate).take(3);
  var newBufferWithImmediateScheduler = RxNew.Observable.interval(25).bufferTime(60).take(3);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old bufferTime() with immediate scheduler', function () {
      oldBufferWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new bufferTime() with immediate scheduler', function () {
      newBufferWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};