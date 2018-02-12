var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldConcatWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .concat(RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate));
  var newConcatWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .concat(RxNew.Observable.range(0, 25));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concat with immediate scheduler', function () {
      oldConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concat with immediate scheduler', function () {
      newConcatWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};