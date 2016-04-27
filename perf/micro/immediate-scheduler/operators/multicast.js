var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldSubject = new RxOld.Subject();
  var newSubject = new RxNew.Subject();

  var oldMulticastWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
    .multicast(oldSubject);
  var newMulticastWithImmediateScheduler = RxNew.Observable.range(0, 25)
    .multicast(newSubject);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }

  oldMulticastWithImmediateScheduler.connect();
  newMulticastWithImmediateScheduler.connect();

  return suite
    .add('old multicast with immediate scheduler', function () {
      oldMulticastWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new multicast with immediate scheduler', function () {
      newMulticastWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
