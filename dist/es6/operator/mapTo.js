import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
class MapToObserver extends Observer {
    constructor(destination, value) {
        super(destination);
        this.value = value;
    }
    _next(_) {
        return this.destination.next(this.value);
    }
}
class MapToObservable extends Observable {
    constructor(source, value) {
        super(null);
        this.source = source;
        this.value = value;
    }
    subscriber(observer) {
        var mapToObserver = new MapToObserver(observer, this.value);
        return Subscription.from(this.source.subscriber(mapToObserver), mapToObserver);
    }
}
export default function mapTo(value) {
    return new MapToObservable(this, value);
}
;
