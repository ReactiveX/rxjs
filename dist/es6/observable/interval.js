import Observable from '../Observable';
import Subscriber from '../Subscriber';
import nextTick from '../scheduler/nextTick';
class IntervalObservable extends Observable {
    constructor(interval, scheduler) {
        super(null);
        this.interval = interval;
        this.scheduler = scheduler;
    }
    subscriber(observer) {
        this.scheduler.schedule(this.interval, new IntervalSubscriber(observer, this.interval, this.scheduler), dispatch);
    }
}
class IntervalSubscriber extends Subscriber {
    constructor(destination, interval, scheduler) {
        super(destination);
        this.counter = 0;
        this.interval = interval;
        this.scheduler = scheduler;
    }
    emitNext() {
        if (!this.isUnsubscribed) {
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
