var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var testThis = {};

  var oldSinglePredicateThisArg = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).single(predicate, testThis);
  var newSinglePredicateThisArg = RxNew.Observable.range(0, 50).single(predicate, testThis);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old single(predicate, thisArg) with immediate scheduler', function () {
        oldSinglePredicateThisArg.subscribe(_next, _error, _complete);
      })
      .add('new single(predicate, thisArg) with immediate scheduler', function () {
        newSinglePredicateThisArg.subscribe(_next, _error, _complete);
      });
};