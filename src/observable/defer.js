var Observable = require("src/Observable");

var DeferObservable = function(){
    
    function DeferObservable(factory) {
        this.factory = factory;
    }
    
    DeferObservable.prototype = Object.create(Observable.prototype);
    
    DeferObservable.prototype._subscribe = function(subscriber) {
        return this.factory().subscribe(subscriber);
    }
    
    return DeferObservable;
}();

module.exports = function(observableFactory) {
    return new DeferObservable(observableFactory);
};