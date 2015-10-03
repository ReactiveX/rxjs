var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var oldEmptyWithImmediateScheduler = RxOld.Observable.empty(RxOld.Scheduler.immediate);
  var newEmptyWithImmediateScheduler = RxNew.Observable.empty();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old empty with immediate scheduler', function () {
      oldEmptyWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new empty with immediate scheduler', function () {
      newEmptyWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};