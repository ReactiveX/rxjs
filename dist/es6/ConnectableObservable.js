import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
export default class ConnectableObservable extends Observable {
    constructor(source, subjectFactory) {
        super(null);
        this.source = source;
        this.subjectFactory = subjectFactory;
    }
    connect() {
        if (!this.subscription) {
            this.subscription = this.source.subscribe(this.subject);
        }
        return this.subscription;
    }
    [$$observer](subscriber) {
        if (!(subscriber instanceof ConnectableSubscriber)) {
            subscriber = new ConnectableSubscriber(subscriber, this);
        }
        if (!this.subject || this.subject.isUnsubscribed) {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
            }
            this.subject = this.subjectFactory();
        }
        this.subject.subscribe(subscriber);
        return subscriber;
    }
    refCount() {
        return new RefCountObservable(this);
    }
}
class ConnectableSubscriber extends Subscriber {
    constructor(destination, source) {
        super(destination);
        this.source = source;
    }
    _complete(value) {
        this.source.subject.remove(this);
        super._complete(value);
    }
}
class RefCountObservable extends Observable {
    constructor(source) {
        super(null);
        this.refCount = 0;
        this.source = source;
    }
    subscriber(subscriber) {
        this.refCount++;
        this.source.subscribe(subscriber);
        var shouldConnect = this.refCount === 1;
        if (shouldConnect) {
            this.connectionSubscription = this.source.connect();
        }
        // HACK: closure, refactor soon    
        return () => {
            this.refCount--;
            if (this.refCount === 0) {
                this.connectionSubscription.unsubscribe();
            }
        };
    }
}
