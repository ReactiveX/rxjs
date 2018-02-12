var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function isEven(x) {
    return x % 2 === 0;
  }

  function greaterThanTen(x) {
    return x > 10;
  }
  var oldFilterWithImmediateScheduler = RxOld.Observable.just(42, RxOld.Scheduler.immediate).filter(greaterThanTen).filter(isEven);
  var newFilterWithImmediateScheduler = RxNew.Observable.of(42).filter(greaterThanTen).filter(isEven);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old filter over scalar in the affirmative with immediate scheduler', function () {
      oldFilterWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new filter over scalar in the affirmative with immediate scheduler', function () {
      newFilterWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
