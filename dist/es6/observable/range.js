import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
class RangeObservable extends Observable {
    constructor(start, end) {
        super(null);
        this.end = end;
        this.start = start;
    }
    [$$observer](observer) {
        var end = this.end;
        var start = this.start;
        var i;
        for (i = start; i < end && !observer.unsubscribed; i++) {
            observer.next(i);
        }
        observer.complete();
    }
}
export default function range(start = 0, end = 0) {
    return new RangeObservable(Math.min(start, end), Math.max(start, end));
}
;
