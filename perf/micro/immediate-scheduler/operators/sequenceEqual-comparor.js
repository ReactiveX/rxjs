var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function comparor(a, b) {
    return a.value === b.value;
  }

  var values = [1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { value: x }; });

  var _old = RxOld.Observable.of.apply(null, values.concat(RxOld.Scheduler.immediate))
    .sequenceEqual(RxOld.Observable.of.apply(null, values.concat(RxOld.Scheduler.immediate)), comparor);
  var _new = RxNew.Observable.of.apply(null, values).sequenceEqual(RxNew.Observable.of.apply(null, values), comparor);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old sequenceEqual with comparor with immediate scheduler', function () {
      _old.subscribe(_next, _error, _complete);
    })
    .add('new sequenceEqual with comparor with immediate scheduler', function () {
      _new.subscribe(_next, _error, _complete);
    });
};
