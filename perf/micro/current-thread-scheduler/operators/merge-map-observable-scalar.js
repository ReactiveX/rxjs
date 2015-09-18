var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var oldMergeMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).mergeMap(RxOld.Observable.return(0, RxOld.Scheduler.currentThread));
    var newMergeMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).mergeMapTo(RxNew.Observable.of(0, RxNew.Scheduler.immediate));

    return suite
        .add('old mergeMap (scalar Observable) with current thread scheduler', function () {
            oldMergeMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new mergeMap (scalar Observable) with current thread scheduler', function () {
            newMergeMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};