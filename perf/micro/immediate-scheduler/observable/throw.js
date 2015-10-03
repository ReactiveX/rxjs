var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function _throw(suite) {
  var oldThrowWithImmediateScheduler = RxOld.Observable.throw(new Error('error'), RxOld.Scheduler.immediate);
  var newThrowWithImmediateScheduler = RxNew.Observable.throw(new Error('error'));

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old throw with immediate scheduler', function () {
      oldThrowWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new throw with immediate scheduler', function () {
      newThrowWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};