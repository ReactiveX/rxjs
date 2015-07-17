import Observer from '../Observer';
import ObserverFactory from '../ObserverFactory';
class MapToObserver extends Observer {
    constructor(destination, value) {
        super(destination);
        this.value = value;
    }
    _next(_) {
        return this.destination.next(this.value);
    }
}
class MapToObserverFactory extends ObserverFactory {
    constructor(value) {
        super();
        this.value = value;
    }
    create(destination) {
        return new MapToObserver(destination, this.value);
    }
}
export default function mapTo(value) {
    return this.lift(new MapToObserverFactory(value));
}
;
