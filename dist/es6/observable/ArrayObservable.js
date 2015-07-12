import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
export default class ArrayObservable extends Observable {
    constructor(array) {
        super(null);
        this.array = array;
    }
    [$$observer](observer) {
        var i, len;
        var array = this.array;
        if (Array.isArray(array)) {
            for (i = 0, len = array.length; i < len && !observer.unsubscribed; i++) {
                observer.next(array[i]);
            }
        }
        observer.complete();
    }
}
