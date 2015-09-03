var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldStartWithWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).startWith(5, RxOld.Scheduler.immediate);
    var newStartWithWithImmediateScheduler = RxNew.Observable.of(25).startWith(5);

    return suite
        .add('old startWith with immediate scheduler', function () {
            oldStartWithWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new startWith with immediate scheduler', function () {
            newStartWithWithImmediateScheduler.subscribe(_next, _error, _complete);
        });

    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};