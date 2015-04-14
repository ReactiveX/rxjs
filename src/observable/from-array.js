var Observable = require("src/Observable");

var FromArrayObservable = function() {
    
    function FromArrayObservable(array, scheduler) {
        this.array = array;
        this.scheduler = scheduler;
    }
    
    FromArrayObservable.prototype = Object.create(Observable.prototype);
    
    FromArrayObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var scheduler = state && subscriber || undefined,
            i = state ? state[1] : -1,
            array = state ? state[2] : this.array,
            n = array.length,
            result = state ? state[3] : { done: false, value: undefined };
        
        subscriber = state ? state[0] : subscriber;
        
        if(subscriber.disposed) {
            result.done = true;
            return result;
        }
        
        if(scheduler) {
            if((state[1] = ++i) < n) {
                result = state[3] = subscriber.next(array[i]);
                if(result.done) {
                    return result;
                }
                return scheduler.schedule(state, _subscribe);
            } else if(result.done) {
                return result;
            } else {
                return subscriber.return();
            }
        } else if(scheduler = this.scheduler) {
            return scheduler.schedule([subscriber, i, array, result], _subscribe);
        } else {
            while(++i < n) {
                result = subscriber.next(array[i]);
                if(result.done) {
                    return result;
                }
            }
            return subscriber.return();
        }
    }
    
    return FromArrayObservable;
}();

module.exports = function (array, scheduler) {
    return new FromArrayObservable(array, scheduler);
};