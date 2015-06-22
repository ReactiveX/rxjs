import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';
class ToArrayObserver extends Observer {
    constructor(destination) {
        super(destination);
        this.array = [];
    }
    _next(value) {
        this.array.push(value);
        return { done: false };
    }
    _return(value) {
        this.destination.next(this.array);
        return this.destination.return(value);
    }
}
class ToArrayObservable extends Observable {
    constructor(source) {
        super(null);
        this.source = source;
    }
    subscriber(observer) {
        var toArrayObserver = new ToArrayObserver(observer);
        return Subscription.from(this.source.subscriber(toArrayObserver), toArrayObserver);
    }
}
export default function toArray() {
    return new ToArrayObservable(this);
}
