var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldFilterWithCurrentThreadScheduler = RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread).filter(divByTwo).filter(divByTen);
    var newFilterWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.immediate).filter(divByTwo).filter(divByTen);

    return suite
        .add('old filter with current thread scheduler', function () {
            oldFilterWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new filter with current thread scheduler', function () {
            newFilterWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });

    function divByTwo(x) {
        return x / 2 === 0;
    }

    function divByTen(x) {
        return x / 10 === 0;
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};
