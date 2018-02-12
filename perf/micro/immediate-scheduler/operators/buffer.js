var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldBufferWithImmediateScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.immediate)
    .buffer(RxOld.Observable.interval(50)).take(3);
  var newBufferWithImmediateScheduler = RxNew.Observable.interval(25)
    .buffer(RxNew.Observable.interval(50)).take(3);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old buffer() with immediate scheduler', function () {
      oldBufferWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new buffer() with immediate scheduler', function () {
      newBufferWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};