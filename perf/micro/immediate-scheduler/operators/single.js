var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSingleNoArgs = RxOld.Observable.of(25, RxOld.Scheduler.immediate).single();
  var newSingleNoArgs = RxNew.Observable.of(25).single();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old single() with immediate scheduler', function () {
      oldSingleNoArgs.subscribe(_next, _error, _complete);
    })
    .add('new single() with immediate scheduler', function () {
      newSingleNoArgs.subscribe(_next, _error, _complete);
    });
};