var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function just(suite) {

    var oldJustWithImmediateScheduler = RxOld.Observable.just(25, RxOld.Scheduler.immediate);
    var newJustWithImmediateScheduler = RxNew.Observable.just(25);

    // add tests
    return suite
        .add('old just with immediate scheduler', function () {
            oldJustWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new just with immediate scheduler', function () {
            newJustWithImmediateScheduler.subscribe(_next, _error, _complete);
        });
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};