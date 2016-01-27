var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var source = Array.from({ length: 100 }, function (_, i) { return i; });
  var _old = RxOld.Observable.fromArray(source);
  var _new = RxNew.Observable.fromArray(source);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old groupBy with current thread scheduler', function () {
      _old.do(_next, _error, _complete).subscribe(_next);
    })
    .add('new groupBy with current thread scheduler', function () {
      _new.do(_next, _error, _complete).subscribe();
    });
};