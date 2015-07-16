import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
export default class Subject extends Observable {
    constructor() {
        super(null);
        this.disposed = false;
        this.subscribers = [];
        this.unsubscribed = false;
    }
    dispose() {
        this.disposed = true;
        if (this._dispose) {
            this._dispose();
        }
    }
    [$$observer](observer) {
        var subscriber = new Subscriber(observer);
        this.subscribers.push(subscriber);
        return subscriber;
    }
    next(value) {
        if (this.unsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.next(value));
        this._cleanUnsubbedSubscribers();
    }
    error(err) {
        if (this.unsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.error(err));
        this.unsubscribe();
        this._cleanUnsubbedSubscribers();
    }
    complete(value) {
        if (this.unsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.complete(value));
        this.unsubscribe();
        this._cleanUnsubbedSubscribers();
    }
    _cleanUnsubbedSubscribers() {
        var i;
        var subscribers = this.subscribers;
        for (i = subscribers.length; i--;) {
            if (subscribers[i].isUnsubscribed) {
                subscribers.splice(i, 1);
            }
        }
        if (subscribers.length === 0) {
            this.unsubscribe();
        }
    }
    unsubscribe() {
        this.subscribers.length = 0;
        this.unsubscribed = true;
    }
}
