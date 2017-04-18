var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  // v4 does not have es-observable's `forEach` operator.
  // So this test is just a sample for each revisions of RxNew.
  var oldWithImmediateScheduler = RxOld.Observable.empty(RxOld.Scheduler.immediate);
  var newForEachWithImmediateScheduler = RxNew.Observable.range(0, 25);

  var i = 0;
  function foreach(v) {
    i += v;
  }

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old forEach() with immediate scheduler', function () {
      oldWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new forEach() with immediate scheduler', function () {
      newForEachWithImmediateScheduler.forEach(foreach);
    });
};