import Observer from '../Observer';
import ObserverFactory from '../ObserverFactory';
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
    }
}
class SkipObserverFactory extends ObserverFactory {
    constructor(count) {
        super();
        this.count = count;
    }
    create(destination) {
        return new SkipObserver(destination, this.count);
    }
}
export default function skip(count) {
    return this.lift(new SkipObserverFactory(count));
}
;
