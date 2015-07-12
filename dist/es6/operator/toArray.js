import Observer from '../Observer';
import ObserverFactory from '../ObserverFactory';
class ToArrayObserver extends Observer {
    constructor(destination) {
        super(destination);
        this.array = [];
    }
    _next(value) {
        this.array.push(value);
    }
    _complete(value) {
        this.destination.next(this.array);
        this.destination.complete(value);
    }
}
class ToArrayObserverFactory extends ObserverFactory {
    create(destination) {
        return new ToArrayObserver(destination);
    }
}
export default function toArray() {
    return this.lift(new ToArrayObserverFactory());
}
