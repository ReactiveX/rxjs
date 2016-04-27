var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldPublishWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .publish(function (x) {
      return x;
    });
  var newPublishWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .publish(function (x) {
      return x;
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old publish with selector and immediate scheduler', function () {
      oldPublishWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new publish with selector and immediate scheduler', function () {
      newPublishWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
