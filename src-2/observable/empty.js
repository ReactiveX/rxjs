import Observable from '../Observable';

class EmptyObservable extends Observable {
    constructor(scheduler) {
        this.scheduler = scheduler;
        super(subscribe);
    }
}

function subscribe(s, state) {
    var scheduler = state ? null : this.scheduler,
        subscriber = state ? state : s;
    return scheduler ?
        scheduler.schedule(subscriber, subscribe) :
        subscriber.onCompleted();
}

var staticEmpty = new EmptyObservable();

export default (scheduler) => {
    return scheduler && new EmptyObservable(scheduler) || staticEmpty;
};
