var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldToPromiseWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).toPromise(Promise);
  var newToPromiseWithImmediateScheduler = RxNew.Observable.of(25).toPromise(Promise);

  function _then(x) { }
  return suite
    .add('old toPromise(ctor) with immediate scheduler', function () {
      oldToPromiseWithImmediateScheduler.then(_then);
    })
    .add('new toPromise(ctor) with immediate scheduler', function () {
      newToPromiseWithImmediateScheduler.then(_then);
    });
};