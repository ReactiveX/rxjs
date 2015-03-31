import Observable from '../Observable';

class RangeObservable extends Observable {
    constructor(from, to, scheduler) {
        this.to   = to;
        this.from = from;
        this.scheduler = scheduler;
        super(subscribe);
    }
}

function subscribe(s, state) {
    var scheduler  = state && s || undefined,
        subscriber = state && state.subscriber || s,
        to   = state ? state.to   : this.to,
        from = state ? state.from : this.from - 1,
        active;
    
    if(scheduler) {
        if((state.from = ++from) < to) {
            return subscriber.onNext(from) && scheduler.schedule(state, subscribe);
        } else {
            return subscriber.onCompleted();
        }
    } else if(scheduler = this.scheduler) {
        return !subscriber.disposed && scheduler.schedule({
            subscriber: subscriber, to: to, from: from
        }, subscribe);
    } else {
        while((++from < to) && (active = subscriber.onNext(from))) {}
        return active && subscriber.onCompleted();
    }
}

export default (from, to, scheduler) => {
    return new RangeObservable(Math.min(from, to), Math.max(from, to), scheduler);
};