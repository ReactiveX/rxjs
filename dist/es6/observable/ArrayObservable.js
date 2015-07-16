import Observable from '../Observable';
export default class ArrayObservable extends Observable {
    constructor(array) {
        super(null);
        this.array = array;
    }
    subscriber(subscriber) {
        var i, len;
        var array = this.array;
        if (Array.isArray(array)) {
            for (i = 0, len = array.length; i < len && !subscriber.isUnsubscribed; i++) {
                subscriber.next(array[i]);
            }
        }
        if (subscriber.complete)
            subscriber.complete();
    }
}
