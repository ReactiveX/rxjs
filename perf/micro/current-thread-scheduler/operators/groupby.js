var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function group(x) {
    return x.key;
  }

  var source = Array.apply(null, { length: 25 }).map(function (item, index) {
    return { key: index % 5 };
  });

  var oldGroupByWithCurrentThreadScheduler = RxOld.Observable.fromArray(source, RxOld.Scheduler.currentThread)
    .groupBy(group);
  var newGroupByWithCurrentThreadScheduler = RxNew.Observable.fromArray(source, RxNew.Scheduler.queue)
    .groupBy(group);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old groupBy with current thread scheduler', function () {
      oldGroupByWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new groupBy with current thread scheduler', function () {
      newGroupByWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
};