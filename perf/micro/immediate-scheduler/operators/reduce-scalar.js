var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(acc, x) {
    return x + x;
  }
  var oldReduceWithImmediateScheduler = RxOld.Observable.just(25, RxOld.Scheduler.immediate).reduce(add, 0);
  var newReduceWithImmediateScheduler = RxNew.Observable.of(25).reduce(add, 0);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old reduce with immediate scheduler', function () {
      oldReduceWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new reduce with immediate scheduler', function () {
      newReduceWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};