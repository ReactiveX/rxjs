var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var predicate = function(value, i) {
      return value === 20;
    };
    
    var testThis = {};

    var oldLastPredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last(predicate);
    var newLastPredicate = RxNew.Observable.range(0, 50).last(predicate);
    
    return suite
        .add('old last() with immediate scheduler', function () {
            oldLastPredicate.subscribe(_next, _error, _complete);
        })
        .add('new last() with immediate scheduler', function () {
            newLastPredicate.subscribe(_next, _error, _complete);
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