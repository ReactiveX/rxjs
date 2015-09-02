var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function fromArray(suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }

    var oldFromArrayWithImmediateScheduler = RxOld.Observable.fromArray(args, RxOld.Scheduler.immediate);
    var newFromArrayWithImmediateScheduler = RxNew.Observable.from(args);

    // add tests
    return suite
        .add('old fromArray with immediate scheduler', function () {
            oldFromArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new fromArray with immediate scheduler', function () {
            newFromArrayWithImmediateScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};