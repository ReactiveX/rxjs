var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function fromWithArray(suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }

    // add tests
    return suite
        .add('old from (array) with current thread scheduler', function () {
            RxOld.Observable.from(args, null, null, RxOld.Scheduler.currentThread).subscribe(_next, _error, _complete);
        })
        .add('new from (array) with current thread scheduler', function () {
            RxNew.Observable.from(args, null, null, RxNew.Scheduler.immediate).subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};