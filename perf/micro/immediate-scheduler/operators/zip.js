var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {
    
    var oldZipWithImmediateScheduler = RxOld.Observable.range(0, 25).zip(RxOld.Observable.range(0, 25), add);
    var newZipWithImmediateScheduler = RxNew.Observable.range(0, 25).zip(RxNew.Observable.range(0, 25), add);

    return suite
        .add('old zip() with immediate scheduler', function () {
            oldZipWithImmediateScheduler.subscribe(_next, _error, _complete);
        })
        .add('new zip() with immediate scheduler', function () {
            newZipWithImmediateScheduler.subscribe(_next, _error, _complete);
        });
    
    function add(x, y) {
        return x + y;
    }
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};