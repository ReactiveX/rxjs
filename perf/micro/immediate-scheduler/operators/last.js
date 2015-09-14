var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var predicate = function(value, i) {
      return value === 20;
    };
    
    var testThis = {};

    var oldLastNoArgs = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last();
    var newLastNoArgs = RxNew.Observable.range(0, 50).last();
    var oldLastPredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last(predicate);
    var newLastPredicate = RxNew.Observable.range(0, 50).last(predicate);
    var oldLastPredicateThisArg = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).last(predicate, testThis);
    var newLastPredicateThisArg = RxNew.Observable.range(0, 50).last(predicate, testThis);
    
    return suite
        .add('old last() with immediate scheduler', function () {
            oldLastNoArgs.subscribe(_next, _error, _complete);
        })
        .add('new last() with immediate scheduler', function () {
            newLastNoArgs.subscribe(_next, _error, _complete);
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