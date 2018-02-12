var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function square(x) {
    return x * x;
  }

  function double(x) {
    return x + x;
  }
  var oldSelectWithImmediateScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).map(square).map(double);
  var newSelectWithImmediateScheduler = RxNew.Observable.range(0, 50).map(square).map(double);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old select with immediate scheduler', function () {
      oldSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new select with immediate scheduler', function () {
      newSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};