var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function just(suite) {

    var oldJustWithCurrentThreadScheduler = RxOld.Observable.just(25, RxOld.Scheduler.currentThread);
    var newJustWithCurrentThreadScheduler = RxNew.Observable.just(25, RxNew.Scheduler.immediate);

    // add tests
    return suite
        .add('old just with current thread scheduler', function () {
            oldJustWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new just with current thread scheduler', function () {
            newJustWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};