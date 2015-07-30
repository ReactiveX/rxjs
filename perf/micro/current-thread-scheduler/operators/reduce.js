var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldReduceWithCurrentThreadScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).reduce(add);
    var newReduceWithCurrentThreadScheduler = RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).reduce(add);

    return suite
        .add('old reduce with current thread scheduler', function () {
            oldReduceWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new reduce with current thread scheduler', function () {
            newReduceWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });

    function add(acc, x) {
        return x + x
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};