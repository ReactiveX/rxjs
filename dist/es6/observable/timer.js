import Observable from '../Observable';
import nextTick from '../scheduler/nextTick';
class TimerObservable extends Observable {
    constructor(delay, scheduler) {
        super(null);
        this.delay = delay;
        this.scheduler = scheduler;
    }
    subscriber(subscriber) {
        return this.scheduler.schedule(this.delay, subscriber, dispatch);
    }
}
function dispatch(subscriber) {
    if (!subscriber.isUnsubscribed) {
        subscriber.next(0);
        subscriber.complete();
    }
}
export default function timer(delay = 0, scheduler = nextTick) {
    return new TimerObservable(delay, scheduler);
}
;
