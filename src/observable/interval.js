var Scheduler = require("src/Scheduler");
var Observable = require("src/Observable");

var IntervalObservable = function() {
    
    function IntervalObservable(period, scheduler) {
        this.period = period;
        this.scheduler = scheduler;
    }
    
    IntervalObservable.prototype = Object.create(Observable.prototype);
    
    IntervalObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var scheduler  = state && subscriber || undefined,
            period = state ? state.period : this.period,
            value  = state ? state.value : -1,
            result = state ? state.result : { done: false, value: undefined };
        
        subscriber = state && state.subscriber || subscriber;
        
        if(subscriber.disposed) {
            result.done = true;
            return result;
        }
        
        if(scheduler) {
            result = state.result = subscriber.next(state.value = ++value);
            if(result.done) {
                return result;
            }
            return scheduler.schedule(period, state, _subscribe);
        } else if(scheduler = this.scheduler) {
            return scheduler.schedule(period, {
                subscriber: subscriber,
                value: value,
                period: period
            }, _subscribe);
        } else {
            while(true) {
                result = subscriber.next(++value);
                if(result.done) {
                    return result;
                }
            }
        }
    }
    
    return IntervalObservable;
}();

module.exports = function (period, scheduler) {
    switch(typeof period) {
        case "number":
            scheduler = (period > 0 || undefined) && (scheduler || Scheduler.Scheduler);
        default:
            period = 0;
            scheduler = undefined;
    }
    return new IntervalObservable(period, scheduler);
};