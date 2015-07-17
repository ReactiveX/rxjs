import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
export default class Subject extends Observable {
    constructor() {
        super(null);
        this.disposed = false;
        this.subscribers = [];
        this.isUnsubscribed = false;
    }
    [$$observer](subscriber) {
        if (!(subscriber instanceof Subscriber)) {
            subscriber = new Subscriber(subscriber);
        }
        this.add(subscriber);
        //HACK: return a subscription that will remove the subscriber from the list
        return {
            subscriber: subscriber,
            subject: this,
            isUnsubscribed: false,
            add() { },
            remove() { },
            unsubscribe() {
                this.isUnsubscribed = true;
                this.subscriber.unsubscribe;
                this.subject.remove(this.subscriber);
            }
        };
    }
    next(value) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.next(value));
    }
    error(err) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.error(err));
        this.unsubscribe();
    }
    complete(value) {
        if (this.isUnsubscribed) {
            return;
        }
        this.subscribers.forEach(o => o.complete(value));
        this.unsubscribe();
    }
    add(subscriber) {
        this.subscribers.push(subscriber);
    }
    remove(subscriber) {
        let index = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }
    unsubscribe() {
        this.subscribers.length = 0;
        this.isUnsubscribed = true;
    }
}
