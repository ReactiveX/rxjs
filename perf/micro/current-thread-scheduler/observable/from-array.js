var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function fromArray(suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }

    var oldFromArrayWithCurrentThreadScheduler = RxOld.Observable.fromArray(args, RxOld.Scheduler.currentThread);
    var newFromArrayWithCurrentThreadScheduler = RxNew.Observable.from(args, RxNew.Scheduler.immediate);

    // add tests
    return suite
        .add('old fromArray with current thread scheduler', function () {
            oldFromArrayWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new fromArray with current thread scheduler', function () {
            newFromArrayWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};