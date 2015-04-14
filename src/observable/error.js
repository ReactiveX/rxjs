var Observable = require("src/Observable");

var ErrorObservable = function() {
    
    function ErrorObservable(error, scheduler) {
        this.error = error;
        this.scheduler = scheduler;
    }
    
    ErrorObservable.prototype = Object.create(Observable.prototype);
    
    ErrorObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var scheduler = state ? null : this.scheduler;
        
        subscriber = state ? state.subscriber : subscriber;
        
        if(scheduler) {
            this.subscriber = subscriber;
            return scheduler.schedule(this, _subscribe);
        }
        
        state.subscriber = null;
        
        return subscriber.throw(state.error);
    }
    
    return ErrorObservable;
}();

module.exports = function (error, scheduler) {
    return new ErrorObservable(error, scheduler);
};
