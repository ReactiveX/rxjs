var RxOld = require('rx');
var RxNew = require('../../../../index');

var source = Array.apply(null, { length: 25 });

module.exports = function (suite) {
  var oldSwitchWithImmediateScheduler = RxOld.Observable.from(
    source.map(function () { return RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate); }),
    null,
    this,
    RxOld.Scheduler.immediate
  )
    .switch();
  var newSwitchWithImmediateScheduler = RxNew.Observable.from(
    source.map(function () { return RxNew.Observable.range(0, 25); })
  )
    .switch();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old switch with immediate scheduler', function () {
      oldSwitchWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new switch with immediate scheduler', function () {
      newSwitchWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
