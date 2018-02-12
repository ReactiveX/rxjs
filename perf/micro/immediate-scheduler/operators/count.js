var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).count();
  var newConcatWithImmediateScheduler = RxNew.Observable.range(0, 25).count();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old count with immediate scheduler', function () {
      oldConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new count with immediate scheduler', function () {
      newConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};