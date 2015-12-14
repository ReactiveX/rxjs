var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function of(suite) {
  var args = [];
  for (var i = 0; i < 25; i++) {
    args.push(i);
  }

  var oldOfWithCurrentThreadScheduler = RxOld.Observable.of.apply(null, args.concat(RxOld.Scheduler.currentThread));
  var newOfWithCurrentThreadScheduler = RxNew.Observable.of.apply(null, args.concat(RxNew.Scheduler.queue));

  // add tests
  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old of with current thread scheduler', function () {
      oldOfWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new of with current thread scheduler', function () {
      newOfWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};