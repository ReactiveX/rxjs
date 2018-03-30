var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value) { return value < 25; };
  var oldSkipWhileWithImmediateScheduler =
    RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).skipWhile(predicate);
  var newSkipWhileWithImmediateScheduler =
    RxNew.Observable.range(0, 50).skipWhile(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skipWhile with immediate scheduler', function () {
      oldSkipWhileWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skipWhile with immediate scheduler', function () {
      newSkipWhileWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
