import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
class SkipObserver extends Observer {
    constructor(destination, count) {
        super(destination);
        this.counter = 0;
        this.count = count;
    }
    _next(value) {
        if (this.counter++ >= this.count) {
            return this.destination.next(value);
        }
        return { done: false };
    }
}
class SkipObservable extends Observable {
    constructor(source, count) {
        super(null);
        this.source = source;
        this.count = count;
    }
    subscriber(observer) {
        var skipObserver = new SkipObserver(observer, this.count);
        return Subscription.from(this.source.subscriber(skipObserver), skipObserver);
    }
}
export default function skip(count) {
    return new SkipObservable(this, count);
}
;
