var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldShareReplayWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .shareReplay(3);
  var newShareReplayWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .shareReplay(3);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old shareReplay with immediate scheduler', function () {
      oldShareReplayWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new shareReplay with immediate scheduler', function () {
      newShareReplayWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
