import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
class PromiseObservable extends Observable {
    constructor(promise) {
        super(null);
        this.promise = promise;
    }
    [$$observer](observer) {
        var promise = this.promise;
        if (promise) {
            promise.then(x => {
                if (!observer.unsubscribed) {
                    observer.next(x);
                    observer.complete();
                }
            });
        }
    }
}
export default function fromPromise(promise) {
    return new PromiseObservable(promise);
}
