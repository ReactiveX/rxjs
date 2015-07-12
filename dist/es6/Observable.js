import Observer from './Observer';
import Subscription from './Subscription';
import $$observer from './util/Symbol_observer';
import ObserverFactory from './ObserverFactory';
export default class Observable {
    constructor(subscriber = null) {
        this.source = null;
        this.observerFactory = new ObserverFactory();
        if (subscriber) {
            this.subscriber = subscriber;
        }
    }
    static create(subscriber) {
        return new Observable(subscriber);
    }
    subscriber(observer) {
        return this.source.subscribe(this.observerFactory.create(observer));
    }
    lift(observerFactory) {
        var observable = new Observable();
        observable.source = this;
        observable.observerFactory = observerFactory;
        return observable;
    }
    [$$observer](observer) {
        if (!(observer instanceof Observer)) {
            observer = new Observer(observer);
        }
        return Subscription.from(this.subscriber(observer), observer);
    }
    subscribe(observerOrNext, error = null, complete = null) {
        let observer;
        if (typeof observerOrNext === 'object') {
            observer = observerOrNext;
        }
        else {
            observer = Observer.create(observerOrNext, error, complete);
        }
        return this[$$observer](observer);
    }
    forEach(nextHandler) {
        return new Promise((resolve, reject) => {
            let observer = Observer.create((value) => {
                nextHandler(value);
                return { done: false };
            }, (err) => {
                reject(err);
                return { done: true };
            }, (value) => {
                resolve(value);
                return { done: true };
            });
            this[$$observer](observer);
        });
    }
}
function dispatchSubscription([observer, observable]) {
    return observable[$$observer](observer);
}
