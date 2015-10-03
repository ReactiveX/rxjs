var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (x) {
    return x === 'hi';
  };

  var oldEveryPredicateArgs = RxOld.Observable.of('hi', RxOld.Scheduler.immediate).every(predicate);
  var newEveryPredicateArgs = RxNew.Observable.of('hi').every(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old scalar observable with every(predicate) with immediate scheduler', function () {
      oldEveryPredicateArgs.subscribe(_next, _error, _complete);
    })
    .add('new scalar observable with every(predicate) with immediate scheduler', function () {
      newEveryPredicateArgs.subscribe(_next, _error, _complete);
    });
};