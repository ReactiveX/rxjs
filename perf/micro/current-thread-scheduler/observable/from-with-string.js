var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function fromWithString(suite) {
  var args = [];
  for (var i = 0; i < 25; i++) {
    args.push(i);
  }
  var argStr = args.join('');

  // add tests
  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old from (string) with current thread scheduler', function () {
      RxOld.Observable.from(argStr, null, null, RxOld.Scheduler.currentThread).subscribe(_next, _error, _complete);
    })
    .add('new from (string) with current thread scheduler', function () {
      RxNew.Observable.from(argStr, null, null, RxNew.Scheduler.queue).subscribe(_next, _error, _complete);
    });
};