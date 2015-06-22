import Observer from './Observer';
import Subscription from './Subscription';
import nextTick from './scheduler/nextTick';
import $$observer from './util/Symbol_observer';
export default class Observable {
    constructor(subscriber) {
        if (subscriber) {
            this.subscriber = subscriber;
        }
    }
    static create(subscriber) {
        return new Observable(subscriber);
    }
    subscriber(observer) {
        return void 0;
    }
    [$$observer](observer) {
        return Subscription.from(this.subscriber(observer), observer);
    }
    subscribe(observerOrNextHandler, throwHandler = null, returnHandler = null) {
        var observer;
        if (typeof observerOrNextHandler === 'object') {
            observer = observerOrNextHandler;
        }
        else {
            observer = Observer.create(observerOrNextHandler, throwHandler, returnHandler);
        }
        return nextTick.schedule(0, [observer, this], dispatchSubscription);
    }
    forEach(nextHandler) {
        return new Promise((resolve, reject) => {
            var observer = Observer.create((value) => {
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
