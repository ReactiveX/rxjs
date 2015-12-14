var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function square(x) {
    return x * x;
  }

  function double(x) {
    return x + x;
  }
  var oldSelectWithCurrentThreadScheduler = RxOld.Observable.range(0, 50).map(square).map(double);
  var newSelectWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.queue).map(square).map(double);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old select with current thread scheduler', function () {
      oldSelectWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new select with current thread scheduler', function () {
      newSelectWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};