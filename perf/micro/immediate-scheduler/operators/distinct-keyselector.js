var RxOld = require('rx');
var RxNew = require('../../../../dist/cjs/Rx.KitchenSink');

module.exports = function (suite) {
  var source = Array.from({ length: 25 }, function (_, i) { return { value: i % 3 }; });
  var _old = RxOld.Observable.fromArray(source).distinct(function (x) { return x.value; });
  var _new = RxNew.Observable.fromArray(source).distinct(function (x) { return x.value; });

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
      .add('old count with immediate scheduler', function () {
        _old.subscribe(_next, _error, _complete);
      })
      .add('new count with immediate scheduler', function () {
        _new.subscribe(_next, _error, _complete);
      });
};