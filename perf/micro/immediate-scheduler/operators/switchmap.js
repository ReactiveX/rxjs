var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSwitchMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .flatMapLatest(function (x) {
      return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
    });
  var newSwitchMapWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .switchMap(function (x) {
      return RxNew.Observable.range(x, 25);
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switchMap with immediate scheduler', function () {
      oldSwitchMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switchMap with immediate scheduler', function () {
      newSwitchMapWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};