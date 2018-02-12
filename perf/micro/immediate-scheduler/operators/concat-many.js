var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .concatMap(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
    });
  var newConcatMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .concatMap(function (x) {
      return RxNew.Observable.range(x, 25);
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concatMap with immediate scheduler', function () {
      oldConcatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concatMap with immediate scheduler', function () {
      newConcatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};