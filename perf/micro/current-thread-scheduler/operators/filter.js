var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function divByTwo(x) {
    return x / 2 === 0;
  }
  function divByTen(x) {
    return x / 10 === 0;
  }

  var oldFilterWithCurrentThreadScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread)
    .filter(divByTwo).filter(divByTen);
  var newFilterWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.queue)
    .filter(divByTwo).filter(divByTen);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old filter with current thread scheduler', function () {
      oldFilterWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new filter with current thread scheduler', function () {
      newFilterWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};
