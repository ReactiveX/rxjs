var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSkipWithImmediateScheduler = RxOld.Observable.just(50, RxOld.Scheduler.immediate).skip(0);
  var newSkipWithImmediateScheduler = RxNew.Observable.of(50).skip(0);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skip with immediate scheduler', function () {
      oldSkipWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skip with immediate scheduler', function () {
      newSkipWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};