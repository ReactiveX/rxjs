import Observable from '../Observable';
class ValueObservable extends Observable {
    constructor(value) {
        super(null);
        this.value = value;
    }
    subscriber(subscriber) {
        subscriber.next(this.value);
        subscriber.complete();
    }
}
export default function value(value) {
    return new ValueObservable(value);
}
;
