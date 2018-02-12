var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var object = { value: 25 };
  var oldMapToWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate)
    .map(object);
  var newMapToWithImmediateScheduler = RxNew.Observable.range(0, 50).mapTo(object);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old select(object) with immediate scheduler', function () {
      oldMapToWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new mapTo() with immediate scheduler', function () {
      newMapToWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};