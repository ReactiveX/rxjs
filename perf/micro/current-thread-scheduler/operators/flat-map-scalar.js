var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldFlatMapWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).flatMap(function (x) { return RxOld.Observable.return(x, RxOld.Scheduler.currentThread); });
    var newFlatMapWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).flatMap(function (x) { return RxNew.Observable.of(x); });

    return suite
        .add('old flatMap (scalar) with current thread scheduler', function () {
            oldFlatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new flatMap (scalar) with current thread scheduler', function () {
            newFlatMapWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};