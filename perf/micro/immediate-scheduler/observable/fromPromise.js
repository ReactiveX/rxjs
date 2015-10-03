var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function fromPromise(suite) {
  var promise = new Promise(function (resolve, reject) {
    resolve(25);
  });

  var oldFromPromiseWithImmediateScheduler = RxOld.Observable.fromPromise(promise);
  var newFromPromiseWithImmediateScheduler = RxNew.Observable.fromPromise(promise);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  // add tests
  return suite
    .add('old fromPromise with immediate scheduler', function () {
      oldFromPromiseWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new fromPromise with immediate scheduler', function () {
      newFromPromiseWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};