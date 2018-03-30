var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToArrayWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).toArray();
  var newToArrayWithImmediateScheduler = RxNew.Observable.range(0, 25).toArray();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old toArray with immediate scheduler', function () {
      oldToArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new toArray with immediate scheduler', function () {
      newToArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};