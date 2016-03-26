var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (x) {
    return x === 'hi';
  };

  var oldEveryPredicateArgs = RxOld.Observable.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, this, RxOld.Scheduler.immediate)
    .every(predicate);
  var newEveryPredicateArgs = RxNew.Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    .every(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old static array observable every(predicate) with immediate scheduler', function () {
      oldEveryPredicateArgs.subscribe(_next, _error, _complete);
    })
    .add('new static array observable every(predicate) with immediate scheduler', function () {
      newEveryPredicateArgs.subscribe(_next, _error, _complete);
    });
};