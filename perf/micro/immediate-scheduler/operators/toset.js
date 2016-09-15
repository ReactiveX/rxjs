var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToSetWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).toSet();
  var newToSetWithImmediateScheduler = RxNew.Observable.range(0, 25).toSet();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old toSet with immediate scheduler', function () {
        oldToSetWithImmediateScheduler.subscribe(_next, _error, _complete);
      })
      .add('new toSet with immediate scheduler', function () {
        newToSetWithImmediateScheduler.subscribe(_next, _error, _complete);
      });
};
