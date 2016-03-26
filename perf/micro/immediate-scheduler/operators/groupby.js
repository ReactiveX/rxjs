var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var source = Array.apply(null, { length: 25 }).map(function (item, index) {
    return { key: index % 5 };
  });

  function group(x) {
    return x.key;
  }

  var oldGroupByWithImmediateScheduler = RxOld.Observable.from(source, null, this, RxOld.Scheduler.immediate)
    .groupBy(group);
  var newGroupByWithImmediateScheduler = RxNew.Observable.from(source)
    .groupBy(group);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old groupBy with immediate scheduler', function () {
      oldGroupByWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new groupBy with immediate scheduler', function () {
      newGroupByWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};