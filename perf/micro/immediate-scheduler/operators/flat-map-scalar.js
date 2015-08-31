var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldFlatMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).flatMap(function (x) { return RxOld.Observable.return(x, RxOld.Scheduler.immediate); });
    var newFlatMapWithImmediateScheduler = RxNew.Observable.range(0, 25).flatMap(function (x) { return RxNew.Observable.of(x); });

    return suite
        .add('old flatMap (scalar) with immediate scheduler', function () {
            oldFlatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new flatMap (scalar) with immediate scheduler', function () {
            newFlatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};