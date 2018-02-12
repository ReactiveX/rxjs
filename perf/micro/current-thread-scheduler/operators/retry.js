var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var maxRetryCount = 25;
  var oldRetryCount = 0;
  var newRetryCount = 0;

  var _old = RxOld.Observable.ofWithScheduler(RxOld.Scheduler.currentThread, 5)
    .flatMap(function (x) {
      if (++oldRetryCount < maxRetryCount - 1) {
        return RxOld.Observable.throw(new Error('error'),  RxOld.Scheduler.currentThread);
      }
      return RxOld.Observable.ofWithScheduler(RxOld.Scheduler.currentThread, x);
    }).retry(maxRetryCount);

  var _new = RxNew.Observable.of(5, RxNew.Scheduler.queue)
    .mergeMap(function (x) {
      if (++newRetryCount < maxRetryCount - 1) {
        return RxNew.Observable.throw(new Error('error'), RxNew.Scheduler.queue);
      }
      return RxNew.Observable.of(x, RxNew.Scheduler.queue);
    }).retry(maxRetryCount);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old retry with currentThread scheduler', function () {
      _old.subscribe(_next, _error, _complete);
    })
    .add('new retry with currentThread scheduler', function () {
      _new.subscribe(_next, _error, _complete);
    });
};
