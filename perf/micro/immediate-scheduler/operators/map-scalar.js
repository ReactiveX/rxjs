var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var oldSelectWithImmediateScheduler = RxOld.Observable.just(2, RxOld.Scheduler.immediate).map(square).map(double);
    var newSelectWithImmediateScheduler = RxNew.Observable.of(2).map(square).map(double);

    return suite
        .add('old map of scalar with immediate scheduler', function () {
            oldSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new map of scalar with immediate scheduler', function () {
            newSelectWithImmediateScheduler.subscribe(_next, _error, _complete);
        });

    function square(x) {
        return x * x;
    }

    function double(x) {
        return x + x;
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};