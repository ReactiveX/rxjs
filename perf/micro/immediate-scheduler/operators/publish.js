var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldPublishWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).publish();
  var newPublishWithImmediateScheduler = RxNew.Observable.range(0, 25).publish();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }

  oldPublishWithImmediateScheduler.connect();
  newPublishWithImmediateScheduler.connect();

  return suite
    .add('old publish with immediate scheduler', function () {
      oldPublishWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new publish with immediate scheduler', function () {
      newPublishWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
