var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldRangeWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread);
  var newRangeWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.queue);

  return suite
    .add('old ReplaySubject with immediate scheduler', function () {
      var subject = new RxOld.ReplaySubject(5, 50, RxOld.Scheduler.currentThread);
      oldRangeWithCurrentThreadScheduler.subscribe(subject);
    })
    .add('new ReplaySubject with immediate scheduler', function () {
      var subject = new RxNew.ReplaySubject(5, 50, RxNew.Scheduler.queue);
      newRangeWithCurrentThreadScheduler.subscribe(subject);
    });
};