import Scheduler from '../Scheduler';
import Observable from '../Observable';

class IntervalObservable extends Observable {
    constructor(period, scheduler) {
        this.period = period;
        this.scheduler = scheduler;
        super(subscribe);
    }
}

function subscribe(s, state) {
    
    var scheduler  = state && s || undefined,
        subscriber = state && state.subscriber || s,
        period = state ? state.period : this.period,
        value  = state ? state.value : -1;
    
    if(scheduler) {
        return subscriber.onNext(state.value = ++value) && scheduler.schedule(period, state, subscribe);
    } else if(scheduler = this.scheduler) {
        return !subscriber.disposed && scheduler.schedule(period, {
            subscriber: subscriber, value: value, period: period
        }, subscribe);
    } else {
        while(subscriber.onNext(++value)) {}
        return false;
    }
}

export default (period, scheduler) => {
    return new IntervalObservable(period, (period > 0 || undefined) && (scheduler || Scheduler.scheduler));
};