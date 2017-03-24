var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var source = [];
  for (var i = 0; i < 25; i++) {
    source.push({'p': i});
  }

  var oldPluckWithImmediateScheduler = RxOld.Observable.from(source, null, null, RxOld.Scheduler.immediate).pluck('p');
  var newPluckWithImmediateScheduler = RxNew.Observable.from(source).pluck('p');

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old pluck() with immediate scheduler', function () {
      oldPluckWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new pluck() with immediate scheduler', function () {
      newPluckWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};