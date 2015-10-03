var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (x) {
    return x < 50;
  };

  var testThis = {};

  var oldEveryPredicateThisArgs = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).every(predicate, testThis);
  var newEveryPredicateThisArgs = RxNew.Observable.range(0, 25).every(predicate, testThis);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old every(predicate, thisArg) with immediate scheduler', function () {
      oldEveryPredicateThisArgs.subscribe(_next, _error, _complete);
    })
    .add('new every(predicate, thisArg) with immediate scheduler', function () {
      newEveryPredicateThisArgs.subscribe(_next, _error, _complete);
    });
};