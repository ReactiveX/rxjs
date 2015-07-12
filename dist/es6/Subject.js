import Observable from './Observable';
import $$observer from './util/Symbol_observer';
import Subscription from './Subscription';
export default class Subject extends Observable {
    constructor() {
        super(null);
        this.disposed = false;
        this.observers = [];
        this.unsubscribed = false;
    }
    dispose() {
        this.disposed = true;
        if (this._dispose) {
            this._dispose();
        }
    }
    [$$observer](observer) {
        this.observers.push(observer);
        var subscription = new Subscription(null, observer);
        return subscription;
    }
    next(value) {
        if (this.unsubscribed) {
            return;
        }
        this.observers.forEach(o => o.next(value));
        this._cleanUnsubbedObservers();
    }
    error(err) {
        if (this.unsubscribed) {
            return;
        }
        this.observers.forEach(o => o.error(err));
        this.unsubscribe();
        this._cleanUnsubbedObservers();
    }
    complete(value) {
        if (this.unsubscribed) {
            return;
        }
        this.observers.forEach(o => o.complete(value));
        this.unsubscribe();
        this._cleanUnsubbedObservers();
    }
    _cleanUnsubbedObservers() {
        var i;
        var observers = this.observers;
        for (i = observers.length; i--;) {
            if (observers[i].unsubscribed) {
                observers.splice(i, 1);
            }
        }
        if (observers.length === 0) {
            this.unsubscribe();
        }
    }
    unsubscribe() {
        this.observers.length = 0;
        this.unsubscribed = true;
    }
}
class SubjectSubscription extends Subscription {
    constructor(observer, subject) {
        super(null, observer);
        this.subject = subject;
    }
    unsubscribe() {
        var observers = this.subject.observers;
        var index = observers.indexOf(this.observer);
        if (index !== -1) {
            observers.splice(index, 1);
        }
        super.unsubscribe();
    }
}
