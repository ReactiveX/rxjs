var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldIgnoreElementsWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).ignoreElements();
  var newIgnoreElementsWithImmediateScheduler = RxNew.Observable.range(0, 50).ignoreElements();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old ignoreElements with immediate scheduler', function () {
      oldIgnoreElementsWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new ignoreElements with immediate scheduler', function () {
      newIgnoreElementsWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
