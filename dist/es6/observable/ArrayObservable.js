import Observable from '../Observable';
export default class ArrayObservable extends Observable {
    constructor(array) {
        super(null);
        this.array = array;
    }
    subscriber(observer) {
        var i, len;
        var array = this.array;
        if (Array.isArray(array)) {
            for (i = 0, len = array.length; i < len && !observer.unsubscribed; i++) {
                observer.next(array[i]);
            }
        }
        if (observer.complete)
            observer.complete();
    }
}
