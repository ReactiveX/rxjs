var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var oldSelectWithCurrentThreadScheduler = RxOld.Observable.range(0, 50).map(square).map(double);
    var newSelectWithCurrentThreadScheduler = RxNew.Observable.range(0, 50, RxNew.Scheduler.immediate).map(square).map(double);

    return suite
        .add('old select with current thread scheduler', function () {
            oldSelectWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
        })
        .add('new select with current thread scheduler', function () {
            newSelectWithCurrentThreadScheduler.subscribe(_next, _error, _complete);
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