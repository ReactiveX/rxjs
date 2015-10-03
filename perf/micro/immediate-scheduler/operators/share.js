var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldShareWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).share();
  var newShareWithImmediateScheduler = RxNew.Observable.range(0, 25).share();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old share with immediate scheduler', function () {
      oldShareWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new share with immediate scheduler', function () {
      newShareWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};