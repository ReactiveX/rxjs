var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var maxRetryCount = 25;
  var oldRetryCount = 0;
  var newRetryCount = 0;

  var oldRetryWithImmediateScheduler = RxOld.Observable.of(5, RxOld.Scheduler.immediate)
    .flatMap(function (x) {
      if (++oldRetryCount < maxRetryCount - 1) {
        return RxOld.Observable.throw(new Error('error'),  RxOld.Scheduler.immediate);
      }
      return RxOld.Observable.of(x, RxOld.Scheduler.immediate);
    }).retry(maxRetryCount);
  var newRetryWithImmediateScheduler = RxNew.Observable.of(5)
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
        oldRetryWithImmediateScheduler.subscribe(_next, _error, _complete);
      })
      .add('new retry with immediate scheduler', function () {
        newRetryWithImmediateScheduler.subscribe(_next, _error, _complete);
      });
};