import Observable from '../Observable';
class PromiseObservable extends Observable {
    constructor(promise) {
        super(null);
        this.promise = promise;
    }
    subscriber(observer) {
        var promise = this.promise;
        if (promise) {
            promise.then(x => {
                if (!observer.unsubscribed) {
                    observer.next(x);
                    observer.complete();
                }
            }, e => {
                if (!observer.unsubscribed) {
                    observer.error(e);
                }
            });
        }
    }
}
export default function fromPromise(promise) {
    return new PromiseObservable(promise);
}
