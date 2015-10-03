var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, i) {
    return value === 20;
  };

  var oldLastPredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last(predicate);
  var newLastPredicate = RxNew.Observable.range(0, 50).last(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old last(predicate) with immediate scheduler', function () {
      oldLastPredicate.subscribe(_next, _error, _complete);
    })
    .add('new last(predicate) with immediate scheduler', function () {
      newLastPredicate.subscribe(_next, _error, _complete);
    });
};