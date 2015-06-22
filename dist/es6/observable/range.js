import Observable from '../Observable';
class RangeObservable extends Observable {
    constructor(start, end) {
        super(null);
        this.end = end;
        this.start = start;
    }
    subscriber(observer) {
        var end = this.end;
        var start = this.start;
        var i;
        for (i = start; i < end && !observer.unsubscribed; i++) {
            observer.next(i);
        }
        observer.return();
    }
}
export default function range(start = 0, end = 0) {
    return new RangeObservable(Math.min(start, end), Math.max(start, end));
}
;
