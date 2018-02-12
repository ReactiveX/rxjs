var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  function square(x) {
    return x * x;
  }

  function double(x) {
    return x + x;
  }
  var oldSelectWithImmediateScheduler = RxOld.Observable.just(42).map(square).map(double);
  var newSelectWithImmediateScheduler = RxNew.Observable.of(42).map(square).map(double);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old map over scalar with immediate scheduler', function () {
      oldSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new map over scalar with immediate scheduler', function () {
      newSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};