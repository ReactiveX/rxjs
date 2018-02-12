var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function add(x, y) {
    return x + y;
  }
  var _old = RxOld.Observable.range(0, 25).withLatestFrom(
    RxOld.Observable.range(0, 25),
    add
  );
  var _new = RxNew.Observable.range(0, 25).withLatestFrom(
    RxNew.Observable.range(0, 25),
    add
  );

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old withLatestFrom with immediate scheduler', function () {
      _old.subscribe(_next, _error, _complete);
    })
    .add('new withLatestFrom with immediate scheduler', function () {
      _new.subscribe(_next, _error, _complete);
    });
};