var Observable = require("src/Observable");

var EmptyObservable = function() {
    
    function EmptyObservable(scheduler) {
        this.scheduler = scheduler;
    }
    
    EmptyObservable.prototype = Object.create(Observable.prototype);
    
    EmptyObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var scheduler  = state ? null : this.scheduler;
        
        subscriber = state ? state.subscriber : subscriber;
        
        if(scheduler) {
            this.subscriber = subscriber;
            return scheduler.schedule(this, _subscribe);
        }
        
        state.subscriber = null;
        
        return subscriber.return();
    }
    
    return EmptyObservable;
}();

var staticEmpty = new EmptyObservable();

module.exports = function (scheduler) {
    return scheduler && new EmptyObservable(scheduler) || staticEmpty;
};
