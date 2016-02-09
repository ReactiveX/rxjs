var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function toObservableOld(x) {
    return RxOld.Observable.range(0, 3);
  }
  function toObservableNew(x) {
    return RxNew.Observable.range(0, 3);
  }
  var _old = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).map(toObservableOld).mergeAll();
  var _new = RxNew.Observable.range(0, 50).map(toObservableNew).mergeAll();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old map and mergeAll with immediate scheduler', function () {
        _old.subscribe(_next, _error, _complete);
      })
      .add('new map and mergeAll with immediate scheduler', function () {
        _new.subscribe(_next, _error, _complete);
      });
};