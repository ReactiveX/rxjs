import $$observer from './util/Symbol_observer';
import SubscriberFactory from './SubscriberFactory';
import Subscriber from './Subscriber';
export default class Observable {
    constructor(subscriber = null) {
        this.source = null;
        this.subscriberFactory = new SubscriberFactory();
        if (subscriber) {
            this.subscriber = subscriber;
        }
        this.source = this;
    }
    static create(subscriber) {
        return new Observable(subscriber);
    }
    subscriber(subscriber) {
        return this.source.subscribe(this.subscriberFactory.create(subscriber));
    }
    lift(subscriberFactory) {
        var observable = new Observable();
        observable.source = this;
        observable.subscriberFactory = subscriberFactory;
        return observable;
    }
    [$$observer](observer) {
        let subscriber = new Subscriber(observer);
        this.subscriber(subscriber);
    }
    subscribe(observerOrNext, error = null, complete = null) {
        let observer;
        if (typeof observerOrNext === 'object') {
            observer = observerOrNext;
        }
        else {
            observer = {
                next: observerOrNext,
                error,
                complete
            };
        }
        return this[$$observer](observer);
    }
    forEach(nextHandler) {
        return new Promise((resolve, reject) => {
            let observer = {
                next: nextHandler,
                error(err) {
                    reject(err);
                },
                complete(value) {
                    resolve(value);
                }
            };
            this[$$observer](observer);
        });
    }
}
function dispatchSubscription([observer, observable]) {
    return observable[$$observer](observer);
}
