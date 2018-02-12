var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldBufferCountWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).bufferWithCount(5);
  var newBufferCountWithImmediateScheduler = RxNew.Observable.range(0, 25).bufferCount(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old bufferCount with immediate scheduler', function () {
      oldBufferCountWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new bufferCount with immediate scheduler', function () {
      newBufferCountWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};