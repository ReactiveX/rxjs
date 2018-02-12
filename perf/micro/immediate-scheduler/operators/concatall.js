var RxOld = require('rx');
var RxNew = require('../../../../index');

var source = Array.apply(null, { length: 25 });

module.exports = function (suite) {
  var oldConcatAllWithImmediateScheduler = RxOld.Observable.from(
    source.map(function () { return RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate); }),
    null,
    this,
    RxOld.Scheduler.immediate
  )
    .concatAll();
  var newConcatAllWithImmediateScheduler = RxNew.Observable.from(
    source.map(function () { return RxNew.Observable.range(0, 25); })
  )
    .concatAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old concatAll with immediate scheduler', function () {
      oldConcatAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new concatAll with immediate scheduler', function () {
      newConcatAllWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
