import Observable from '../Observable';

class FromArrayObservable extends Observable {
    constructor(array, scheduler) {
        this.array = array;
        this.scheduler = scheduler;
        super(subscribe);
    }
}

function subscribe(s, state) {
    
    var scheduler = state && s || undefined,
        subscriber = state && state[0] || s,
        i = state && state[1] || -1,
        array = state && state[2] || this.array,
        n = array.length, active;
    
    if(scheduler) {
        if((state[1] = ++i) < n) {
            return subscriber.onNext(array[i]) && scheduler.schedule(state, subscribe);
        } else {
            return subscriber.onCompleted();
        }
    } else if(scheduler = this.scheduler) {
        return !subscriber.disposed && scheduler.schedule([subscriber, ++i, array], subscribe);
    } else {
        while((++i < n) && (active = subscriber.onNext(array[i]))) {}
        return active && subscriber.onCompleted();
    }
}

export default (array, scheduler) => {
    return new FromArrayObservable(array, scheduler);
};