import Observable from '../Observable';

class ErrorObservable extends Observable {
    constructor(error, scheduler) {
        this.error = error;
        this.scheduler = scheduler;
        super(subscribe);
    }
}

function subscribe(s, state) {
    var scheduler = state ? null : this.scheduler,
        subscriber = state ? state.subscriber : s;
    if(scheduler) {
        this.subscriber = subscriber;
        return scheduler.schedule(this, subscribe);
    }
    subscriber.onError(state.error);
}

export default (error, scheduler) => {
    return new ErrorObservable(error, scheduler);
};
