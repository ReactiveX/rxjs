var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldFlatMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).flatMap(function (x) { return RxOld.Observable.range(x, 25, RxOld.Scheduler.currentThread); });
    var newFlatMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).flatMap(function (x) { return RxNew.Observable.range(x, 25, RxNew.Scheduler.immediate); });

    return suite
        .add('old flatMap with current thread scheduler', function () {
            oldFlatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new flatMap with current thread scheduler', function () {
            newFlatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};