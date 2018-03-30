var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var testThis = {};

  var oldFindIndexPredicateThisArg = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).findIndex(predicate, testThis);
  var newFindIndexPredicateThisArg = RxNew.Observable.range(0, 50).findIndex(predicate, testThis);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old findIndex(predicate, thisArg) with immediate scheduler', function () {
      oldFindIndexPredicateThisArg.subscribe(_next, _error, _complete);
    })
    .add('new findIndex(predicate, thisArg) with immediate scheduler', function () {
      newFindIndexPredicateThisArg.subscribe(_next, _error, _complete);
    });
};