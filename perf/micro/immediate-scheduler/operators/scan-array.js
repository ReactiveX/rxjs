var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(acc, x) {
    return x + x;
  }

  var oldScanArrayWithImmediateScheduler = RxOld.Observable.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    null,
    this,RxOld.Scheduler.immediate
  ).scan(add);
  var newScanArrayWithImmediateScheduler = RxNew.Observable.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).scan(add);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old static array observable scan with immediate scheduler', function () {
      oldScanArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new static array observable scan with immediate scheduler', function () {
      newScanArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};