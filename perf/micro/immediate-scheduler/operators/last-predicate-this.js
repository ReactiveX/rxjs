var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var testThis = {};

  var oldLastPredicateThisArg = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last(predicate, testThis);
  var newLastPredicateThisArg = RxNew.Observable.range(0, 50).last(predicate, testThis);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old last(predicate, thisArg) with immediate scheduler', function () {
      oldLastPredicateThisArg.subscribe(_next, _error, _complete);
    })
    .add('new last(predicate, thisArg) with immediate scheduler', function () {
      newLastPredicateThisArg.subscribe(_next, _error, _complete);
    });
};