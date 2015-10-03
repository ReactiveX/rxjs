var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function never(suite) {
  var oldNeverWithImmediateScheduler = RxOld.Observable.never();
  var newNeverWithImmediateScheduler = RxNew.Observable.never();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old never with immediate scheduler', function () {
      oldNeverWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new never with immediate scheduler', function () {
      newNeverWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};