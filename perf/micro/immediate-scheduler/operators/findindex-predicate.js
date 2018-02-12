var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var oldFindIndexPredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).findIndex(predicate);
  var newFindIndexPredicate = RxNew.Observable.range(0, 50).findIndex(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old findIndex(predicate) with immediate scheduler', function () {
      oldFindIndexPredicate.subscribe(_next, _error, _complete);
    })
    .add('new findIndex(predicate) with immediate scheduler', function () {
      newFindIndexPredicate.subscribe(_next, _error, _complete);
    });
};