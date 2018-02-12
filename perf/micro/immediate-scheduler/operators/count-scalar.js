var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatWithImmediateScheduler = RxOld.Observable.just(25, RxOld.Scheduler.immediate).count();
  var newConcatWithImmediateScheduler = RxNew.Observable.of(25).count();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old count over scalar with immediate scheduler', function () {
      oldConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new count over scalar with immediate scheduler', function () {
      newConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};