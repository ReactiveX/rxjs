var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToPromiseWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).toPromise();
  var newToPromiseWithImmediateScheduler = RxNew.Observable.of(25).toPromise();

  function _then(x) { }
  return suite
    .add('old toPromise() with immediate scheduler', function () {
      oldToPromiseWithImmediateScheduler.then(_then);
    })
    .add('new toPromise() with immediate scheduler', function () {
      newToPromiseWithImmediateScheduler.then(_then);
    });
};