var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatAllWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
    .map(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.currentThread);
    }).concatAll();
  var newConcatAllWithCurrentThreadScheduler = RxNew.Observable.range(0, 25)
    .map(function (x) {
      return RxNew.Observable.range(x, 25);
    }).concatAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concatAll with current thread scheduler', function () {
      oldConcatAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concatAll with current thread scheduler', function () {
      newConcatAllWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};