var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldRepeatWithImmediateScheduler = RxOld.Observable.of(25, RxOld.Scheduler.immediate).repeat(5, RxOld.Scheduler.immediate);
    var newRepeatWithImmediateScheduler = RxNew.Observable.of(25).repeat(5);

    return suite
        .add('old repeat with immediate scheduler', function () {
            oldRepeatWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new repeat with immediate scheduler', function () {
            newRepeatWithImmediateScheduler.subscribe(_next, _error, _complete);
        });

    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};