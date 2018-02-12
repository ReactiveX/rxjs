var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldWindowCountWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).windowWithCount(5);
  var newWindowCountWithImmediateScheduler = RxNew.Observable.range(0, 25).windowCount(5);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old windowCount with immediate scheduler', function () {
      oldWindowCountWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new windowCount with immediate scheduler', function () {
      newWindowCountWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};