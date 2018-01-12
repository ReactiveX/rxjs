var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSkipLastWithImmediateScheduler = RxOld.Observable.range(0, 500, RxOld.Scheduler.currentThread).skipLast(50);
  var newSkipLastWithImmediateScheduler = RxNew.Observable.range(0, 500, RxNew.Scheduler.queue).skipLast(50);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old skipLast with current thread scheduler', function () {
      oldSkipLastWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new skipLast with current thread scheduler', function () {
      newSkipLastWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
