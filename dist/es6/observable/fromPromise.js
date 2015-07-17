import Observable from '../Observable';
class PromiseObservable extends Observable {
    constructor(promise) {
        super(null);
        this.promise = promise;
    }
    subscriber(subscriber) {
        var promise = this.promise;
        if (promise) {
            promise.then(x => {
                if (!subscriber.isUnsubscribed) {
                    subscriber.next(x);
                    subscriber.complete();
                }
            }, e => {
                if (!subscriber.isUnsubscribed) {
                    subscriber.error(e);
                }
            });
        }
    }
}
export default function fromPromise(promise) {
    return new PromiseObservable(promise);
}
