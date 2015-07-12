import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
class ValueObservable extends Observable {
    constructor(value) {
        super(null);
        this.value = value;
    }
    [$$observer](observer) {
        observer.next(this.value);
        observer.complete();
    }
}
export default function value(value) {
    return new ValueObservable(value);
}
;
