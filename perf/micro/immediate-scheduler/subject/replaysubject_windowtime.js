var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldRangeWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate);
  var newRangeWithImmediateScheduler = RxNew.Observable.range(0, 25);

  return suite
    .add('old ReplaySubject with immediate scheduler', function () {
      var subject = new RxOld.ReplaySubject(5, 50, RxOld.Scheduler.immediate);
      oldRangeWithImmediateScheduler.subscribe(subject);
    })
    .add('new ReplaySubject with immediate scheduler', function () {
      var subject = new RxNew.ReplaySubject(5, 50);
      newRangeWithImmediateScheduler.subscribe(subject);
    });
};