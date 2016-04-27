var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldMulticastWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .multicast(function () {
      return new RxOld.Subject();
    }, function (x) {
      return x;
    });
  var newMulticastWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .multicast(function () {
      return new RxNew.Subject();
    }, function (x) {
      return x;
    });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old multicast with selector and immediate scheduler', function () {
      oldMulticastWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new multicast with selector and immediate scheduler', function () {
      newMulticastWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
