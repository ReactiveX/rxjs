var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSkipWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).skip(25);
  var newSkipWithImmediateScheduler = RxNew.Observable.range(0, 50).skip(25);

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