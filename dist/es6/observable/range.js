import Observable from '../Observable';
class RangeObservable extends Observable {
    constructor(start, end) {
        super(null);
        this.end = end;
        this.start = start;
    }
    subscriber(subscriber) {
        var end = this.end;
        var start = this.start;
        var i;
        for (i = start; i < end && !subscriber.isUnsubscribed; i++) {
            subscriber.next(i);
        }
        subscriber.complete();
    }
}
export default function range(start = 0, end = 0) {
    return new RangeObservable(Math.min(start, end), Math.max(start, end));
}
;
