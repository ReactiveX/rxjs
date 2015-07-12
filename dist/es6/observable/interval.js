import Observable from '../Observable';
import Observer from '../Observer';
import nextTick from '../scheduler/nextTick';
import $$observer from '../util/Symbol_observer';
class IntervalObservable extends Observable {
    constructor(interval, scheduler) {
        super(null);
        this.interval = interval;
        this.scheduler = scheduler;
    }
    [$$observer](observer) {
        this.scheduler.schedule(this.interval, new IntervalObserver(observer, this.interval, this.scheduler), dispatch);
    }
}
class IntervalObserver extends Observer {
    constructor(destination, interval, scheduler) {
        super(destination);
        this.counter = 0;
        this.interval = interval;
        this.scheduler = scheduler;
    }
    emitNext() {
        if (!this.unsubscribed) {
            this.next(this.counter++);
            this.scheduler.schedule(this.interval, this, dispatch);
        }
    }
}
function dispatch(observer) {
    observer.emitNext();
}
export default function timer(interval = 0, scheduler = nextTick) {
    return new IntervalObservable(interval, scheduler);
}
;
