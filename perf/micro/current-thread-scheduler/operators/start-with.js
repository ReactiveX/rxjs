var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldStartWithWithCurrentThreadScheduler = RxOld.Observable.of(25, RxOld.Scheduler.currentThread).startWith(5, RxOld.Scheduler.currentThread);
    var newStartWithWithCurrentThreadScheduler = RxNew.Observable.of(25, RxNew.Scheduler.immediate).startWith(5, RxNew.Scheduler.immediate);

    return suite
        .add('old startWith with current thread scheduler', function () {
            oldStartWithWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new startWith with current thread scheduler', function () {
            newStartWithWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });

    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};