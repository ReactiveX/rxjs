var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldReduceWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).reduce(add);
    var newReduceWithImmediateScheduler = RxNew.Observable.range(0, 25).reduce(add);

    return suite
        .add('old reduce with immediate scheduler', function () {
            oldReduceWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new reduce with immediate scheduler', function () {
            newReduceWithImmediateScheduler.subscribe(_next, _error, _complete);
        });

    function add(acc, x) {
        return x + x
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};