import Observable from '../Observable';
import nextTick from '../scheduler/nextTick';
class TimerObservable extends Observable {
    constructor(delay, scheduler) {
        super(null);
        this.delay = delay;
        this.scheduler = scheduler;
    }
    subscriber(observer) {
        this.scheduler.schedule(this.delay, observer, dispatch);
    }
}
function dispatch(observer) {
    if (!observer.unsubscribed) {
        observer.next(0);
        observer.return();
    }
}
export default function timer(delay = 0, scheduler = nextTick) {
    return new TimerObservable(delay, scheduler);
}
;
