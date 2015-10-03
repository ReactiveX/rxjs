var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var predicate = function (value, index) {
    return value === 20;
  };

  var oldFirstNoArgs = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).first(predicate);
  var newFirstNoArgs = RxNew.Observable.range(0, 50).first(predicate);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old first(predicate) with immediate scheduler', function () {
      oldFirstNoArgs.subscribe(_next, _error, _complete);
    })
    .add('new first(predicate) with immediate scheduler', function () {
      newFirstNoArgs.subscribe(_next, _error, _complete);
    });
};