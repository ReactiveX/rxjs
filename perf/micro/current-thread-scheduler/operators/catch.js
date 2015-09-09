var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

  var oldCatchWithCurrentThreadScheduler = RxOld.Observable.throw(new Error('error'), RxOld.Scheduler.currentThread).catch(RxOld.Observable.of(25, RxOld.Scheduler.currentThread));
  var newCatchWithCurrentThreadScheduler = RxNew.Observable.throw(new Error('error'), RxNew.Scheduler.immediate).catch(RxNew.Observable.of(25, RxNew.Scheduler.immediate));

  return suite
    .add('old catch with current thread scheduler', function () {
      oldCatchWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    })
    .add('new catch with current thread scheduler', function () {
      newCatchWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
    });
    
  function _next(x) { }
  function _error(e){ }
  function _complete(){ }
};