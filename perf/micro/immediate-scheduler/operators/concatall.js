var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatAllWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .map(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
    }).concatAll();
  var newConcatAllWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .map(function (x) {
      return RxNew.Observable.range(x, 25);
    }).concatAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old concatAll with immediate scheduler', function () {
        oldConcatAllWithImmediateScheduler.subscribe(_next, _error, _complete);
      })
      .add('new concatAll with immediate scheduler', function () {
        newConcatAllWithImmediateScheduler.subscribe(_next, _error, _complete);
      });
};