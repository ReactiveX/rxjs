var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function zip(suite) {
  function add(x, y) {
    return x + y;
  }
  var oldZipWithImmediateScheduler = RxOld.Observable.zip(
    RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate),
    RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate), add
  );
  var newZipWithImmediateScheduler = RxNew.Observable.zip(
    RxNew.Observable.range(0, 25),
    RxNew.Observable.range(0, 25), add
  );

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old Observable.zip with immediate scheduler', function () {
      oldZipWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new Observable.zip with immediate scheduler', function () {
      newZipWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};