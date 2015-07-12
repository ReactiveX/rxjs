import Observable from '../Observable';
import nextTick from '../scheduler/nextTick';
import $$observer from '../util/Symbol_observer';
class TimerObservable extends Observable {
    constructor(delay, scheduler) {
        super(null);
        this.delay = delay;
        this.scheduler = scheduler;
    }
    [$$observer](observer) {
        this.scheduler.schedule(this.delay, observer, dispatch);
    }
}
function dispatch(observer) {
    if (!observer.unsubscribed) {
        observer.next(0);
        observer.complete();
    }
}
export default function timer(delay = 0, scheduler = nextTick) {
    return new TimerObservable(delay, scheduler);
}
;
