var Observable = require("src/Observable");

var ValueObservable = function() {
    
    function ValueObservable(value, scheduler) {
        this.value = value;
        this.scheduler = scheduler;
    }
    
    ValueObservable.prototype = Object.create(Observable.prototype);
    
    ValueObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var scheduler  = state ? subscriber : null,
            result = state ? state.result : { done: false, value: undefined };
        
        subscriber = state ? state.subscriber : subscriber;
        
        if(subscriber.disposed) {
            result.done = true;
            return result;
        }
        
        if(scheduler) {
            if(state.phase === "N") {
                state.phase = "C";
                result = state.result = subscriber.next(state.value);
                if(result.done) {
                    return result;
                }
                return scheduler.schedule(state, _subscribe);
            }
            return subscriber.return();
        } else if(scheduler = this.scheduler) {
            return scheduler.schedule({
                phase: "N",
                result: result,
                subscriber: subscriber
            }, _subscribe);
        } else {
            result = subscriber.next(this.value);
            if(result.done) {
                return result;
            }
            return subscriber.return();
        }
    }
    
    return ValueObservable;
    
}();

module.exports = function (value, scheduler) {
    return new ValueObservable(value, scheduler);
};
