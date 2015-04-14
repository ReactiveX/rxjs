var Observable = require("src/Observable");

var RangeObservable = function () {
    
    function RangeObservable(from, to, scheduler) {
        this.to   = to;
        this.from = from;
        this.scheduler = scheduler;
    }
    
    RangeObservable.prototype = Object.create(Observable.prototype);
    
    RangeObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(s, state) {
        var scheduler  = state && s || undefined,
            subscriber = state && state.subscriber || s,
            to   = state ? state.to   : this.to,
            from = state ? state.from : this.from - 1,
            result = state ? state.result : { done: false, value: undefined };
        
        if(subscriber.disposed) {
            result.done = true;
            return result;
        }
        
        if(scheduler) {
            if((state.from = ++from) < to) {
                result = state.result = subscriber.next(from);
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
            return scheduler.schedule({
                to: to,
                from: from,
                result: result,
                subscriber: subscriber
            }, _subscribe);
        } else {
            while(++from < to) {
                result = subscriber.next(from);
                if(result.done) {
                    return result;
                }
            }
            return subscriber.return();
        }
    }
    
    return RangeObservable;
}();

module.exports = function (from, to, scheduler) {
    return new RangeObservable(
        Math.min(from || (from = 0), to || (to = 0)),
        Math.max(from, to),
        scheduler
    );
};