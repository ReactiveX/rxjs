var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (x) {
    return x < 50;
  };

  var oldEveryPredicateArgs = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).every(predicate);
  var newEveryPredicateArgs = RxNew.Observable.range(0, 25).every(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old every(predicate) with immediate scheduler', function () {
      oldEveryPredicateArgs.subscribe(_next, _error, _complete);
    })
    .add('new every(predicate) with immediate scheduler', function () {
      newEveryPredicateArgs.subscribe(_next, _error, _complete);
    });
};