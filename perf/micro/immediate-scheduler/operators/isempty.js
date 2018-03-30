var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldIsEmptyNoArgs = RxOld.Observable.of(25, RxOld.Scheduler.immediate).isEmpty();
  var newIsEmptyNoArgs = RxNew.Observable.of(25).isEmpty();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old isEmpty with immediate scheduler', function () {
      oldIsEmptyNoArgs.subscribe(_next, _error, _complete);
    })
    .add('new isEmpty with immediate scheduler', function () {
      newIsEmptyNoArgs.subscribe(_next, _error, _complete);
    });
};