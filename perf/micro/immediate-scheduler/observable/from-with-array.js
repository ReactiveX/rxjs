var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function fromWithArray(suite) {
  var args = [];
  for (var i = 0; i < 25; i++) {
    args.push(i);
  }

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old from (array) with immediate scheduler', function () {
      RxOld.Observable.from(args, null, null, RxOld.Scheduler.immediate).subscribe(_next, _error, _complete);
    })
    .add('new from (array) with immediate scheduler', function () {
      RxNew.Observable.from(args, null, null).subscribe(_next, _error, _complete);
    });
};