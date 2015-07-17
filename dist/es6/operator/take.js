import Observer from '../Observer';
import ObserverFactory from '../ObserverFactory';
class TakeObserver extends Observer {
    constructor(destination, count) {
        super(destination);
        this.counter = 0;
        this.count = count;
    }
    _next(value) {
        if (this.counter++ < this.count) {
            this.destination.next(value);
        }
        else {
            this.destination.complete();
        }
    }
}
class TakeObserverFactory extends ObserverFactory {
    constructor(count) {
        super();
        this.count = count;
    }
    create(destination) {
        return new TakeObserver(destination, this.count);
    }
}
export default function take(count) {
    return this.lift(new TakeObserverFactory(count));
}
;
