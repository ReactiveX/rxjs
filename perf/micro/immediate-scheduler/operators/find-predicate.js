var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var oldFindPredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).find(predicate);
  var newFindPredicate = RxNew.Observable.range(0, 50).find(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old find(predicate) with immediate scheduler', function () {
      oldFindPredicate.subscribe(_next, _error, _complete);
    })
    .add('new find(predicate) with immediate scheduler', function () {
      newFindPredicate.subscribe(_next, _error, _complete);
    });
};