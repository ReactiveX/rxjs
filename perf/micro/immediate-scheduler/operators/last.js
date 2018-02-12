var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldLastNoArgs = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last();
  var newLastNoArgs = RxNew.Observable.range(0, 50).last();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old last() with immediate scheduler', function () {
      oldLastNoArgs.subscribe(_next, _error, _complete);
    })
    .add('new last() with immediate scheduler', function () {
      newLastNoArgs.subscribe(_next, _error, _complete);
    });
};