var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var maxRetryCount = 25;
  var oldRetryCount = 0;
  var newRetryCount = 0;

  var _old = RxOld.Observable.ofWithScheduler(RxOld.Scheduler.immediate, 5)
    .flatMap(function (x) {
      if (++oldRetryCount < maxRetryCount - 1) {
        return RxOld.Observable.throw(new Error('error'),  RxOld.Scheduler.immediate);
      }
      return RxOld.Observable.ofWithScheduler(RxOld.Scheduler.immediate, x);
    }).retry(maxRetryCount);

  var _new = RxNew.Observable.of(5)
    .mergeMap(function (x) {
      if (++newRetryCount < maxRetryCount - 1) {
        return RxNew.Observable.throw(new Error('error'));
      }
      return RxNew.Observable.of(x);
    }).retry(maxRetryCount);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old retry with immediate scheduler', function () {
      _old.subscribe(_next, _error, _complete);
    })
    .add('new retry with immediate scheduler', function () {
      _new.subscribe(_next, _error, _complete);
    });
};
