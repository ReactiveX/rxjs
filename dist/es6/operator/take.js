import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
class TakeObserver extends Observer {
    constructor(destination, count) {
        super(destination);
        this.counter = 0;
        this.count = count;
    }
    _next(value) {
        if (this.counter++ < this.count) {
            return this.destination.next(value);
        }
        else {
            return this.destination.return();
        }
    }
}
class TakeObservable extends Observable {
    constructor(source, count) {
        super(null);
        this.source = source;
        this.count = count;
    }
    subscriber(observer) {
        var takeObserver = new TakeObserver(observer, this.count);
        return Subscription.from(this.source.subscriber(takeObserver), takeObserver);
    }
}
export default function take(count) {
    return new TakeObservable(this, count);
}
;
