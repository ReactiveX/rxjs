var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var testThis = {};

  var oldFindPredicateThisArg = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).find(predicate, testThis);
  var newFindPredicateThisArg = RxNew.Observable.range(0, 50).find(predicate, testThis);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old find(predicate, thisArg) with immediate scheduler', function () {
      oldFindPredicateThisArg.subscribe(_next, _error, _complete);
    })
    .add('new find(predicate, thisArg) with immediate scheduler', function () {
      newFindPredicateThisArg.subscribe(_next, _error, _complete);
    });
};