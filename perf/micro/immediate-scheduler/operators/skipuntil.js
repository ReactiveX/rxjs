var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSkipUntilWithImmediateScheduler = RxOld.Observable.interval(25, RxOld.Scheduler.immediate)
    .take(3).skipUntil(RxOld.Observable.timer(60, RxOld.Scheduler.immediate));
  var newSkipUntilWithImmediateScheduler = RxNew.Observable.interval(25)
    .take(3).skipUntil(RxNew.Observable.timer(60));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skipUntil with immediate scheduler', function () {
      oldSkipUntilWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skipUntil with immediate scheduler', function () {
      newSkipUntilWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
