var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function divByTwo(x) {
    return x / 2 === 0;
  }

  function divByTen(x) {
    return x / 10 === 0;
  }
  var oldFilterWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).filter(divByTwo).filter(divByTen);
  var newFilterWithImmediateScheduler = RxNew.Observable.range(0, 50).filter(divByTwo).filter(divByTen);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old filter with immediate scheduler', function () {
      oldFilterWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new filter with immediate scheduler', function () {
      newFilterWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
