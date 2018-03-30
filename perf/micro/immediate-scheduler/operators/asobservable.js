var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldRangeWithImmediateScheduler = RxOld.Observable.range(0, 250, RxOld.Scheduler.immediate);
  var newRangeWithImmediateScheduler = RxNew.Observable.range(0, 250);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old asObservable() with immediate scheduler', function () {
      var oldSubject = new RxOld.Subject();

      oldSubject.asObservable().subscribe(_next, _error, _complete);
      oldRangeWithImmediateScheduler.subscribe(oldSubject);
    })
    .add('new asObservable() with immediate scheduler', function () {
      var newSubject = new RxNew.Subject();

      newSubject.asObservable().subscribe(_next, _error, _complete);
      newRangeWithImmediateScheduler.subscribe(newSubject);
    });
};