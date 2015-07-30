var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var oldFlatMapWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).flatMap(RxOld.Observable.return(0, RxOld.Scheduler.immediate));
    var newFlatMapWithImmediateScheduler = RxNew.Observable.range(0, 25).flatMapTo(RxNew.Observable.return(0));

    return suite
        .add('old flatMap (scalar Observable) with immediate scheduler', function () {
            oldFlatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new flatMap (scalar Observable) with immediate scheduler', function () {
            newFlatMapWithImmediateScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};