import Observable from './Observable';
import $$observer from './util/Symbol_observer';
import Subscription from './Subscription';
export default class Subject extends Observable {
    constructor(...args) {
        super(...args);
        this.disposed = false;
        this.observers = [];
    }
    dispose() {
        this.disposed = true;
        this.observers.length = 0;
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
        if (this.disposed) {
            return { done: true };
        }
        this.observers.forEach(o => o.next(value));
        return { done: false };
    }
    throw(err) {
        if (this.disposed) {
            return { done: true };
        }
        this.observers.forEach(o => o.throw(err));
        this.dispose();
        return { done: true };
    }
    return(value) {
        if (this.disposed) {
            return { done: true };
        }
        this.observers.forEach(o => o.return(value));
        this.dispose();
        return { done: true };
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
