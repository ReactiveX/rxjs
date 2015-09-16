var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

    var predicate = function(value, i) {
      return value === 20;
    };
    
    var oldSinglePredicate = RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate).single(predicate);
    var newSinglePredicate = RxNew.Observable.range(0, 50).single(predicate);
    
    return suite
        .add('old single() with immediate scheduler', function () {
            oldSinglePredicate.subscribe(_next, _error, _complete);
        })
        .add('new single() with immediate scheduler', function () {
            newSinglePredicate.subscribe(_next, _error, _complete);
        });
        
    function _next(x) { }
    function _error(e){ }
    function _complete(){ }
};