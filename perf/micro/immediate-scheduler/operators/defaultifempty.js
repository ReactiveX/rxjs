var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldDefaultIfEmptyWithImmediateScheduler = RxOld.Observable.empty(RxOld.Scheduler.immediate).defaultIfEmpty(25);
  var newDefaultIfEmptyWithImmediateScheduler = RxNew.Observable.empty().defaultIfEmpty(25);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old defaultIfEmpty with immediate scheduler', function () {
      oldDefaultIfEmptyWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new defaultIfEmpty with immediate scheduler', function () {
      newDefaultIfEmptyWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};