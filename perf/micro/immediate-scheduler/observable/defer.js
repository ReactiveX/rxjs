var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var oldObservableWithImmediateScheduler = RxOld.Observable.empty(RxOld.Scheduler.immediate);
  var newObservableWithImmediateScheduler = RxNew.Observable.empty();

  function oldFactory() { return oldObservableWithImmediateScheduler; }
  function newFactory() { return newObservableWithImmediateScheduler; }

  var oldDeferWithImmediateScheduler = RxOld.Observable.defer(oldFactory);
  var newDeferWithImmediateScheduler = RxNew.Observable.defer(newFactory);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old defer with immediate scheduler', function () {
      oldDeferWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new defer with immediate scheduler', function () {
      newDeferWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};