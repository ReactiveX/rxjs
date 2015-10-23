var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldShareBehaviorWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .shareValue(0);
  var newShareBehaviorWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .shareBehavior(0);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old shareBehavior with immediate scheduler', function () {
      oldShareBehaviorWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new shareBehavior with immediate scheduler', function () {
      newShareBehaviorWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
