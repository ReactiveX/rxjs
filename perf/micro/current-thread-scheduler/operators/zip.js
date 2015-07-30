var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldZipWithCurrentThreadScheduler = RxOld.Observable.zip(RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread), RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread), add);
    var newZipWithCurrentThreadScheduler = RxNew.Observable.zip(RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate), RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate), add);

    return suite
        .add('old zip with current thread scheduler', function () {
            oldZipWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new zip with current thread scheduler', function () {
            newZipWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    
    function add(x, y) {
        return x + y;
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};