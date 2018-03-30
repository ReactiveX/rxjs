var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(x, y) {
    return x + y;
  }
  var oldCombineLatestWithImmediateScheduler = RxOld.Observable.combineLatest(
    RxOld.Observable.range(0, 25),
    RxOld.Observable.range(0, 25),
    add
  );
  var newCombineLatestWithImmediateScheduler = RxNew.Observable.combineLatest(
    RxNew.Observable.range(0, 25),
    RxNew.Observable.range(0, 25),
    add
  );

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old combineLatest with immediate scheduler', function () {
      oldCombineLatestWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new combineLatest with immediate scheduler', function () {
      newCombineLatestWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};