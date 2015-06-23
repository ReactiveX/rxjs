import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import nextTick from './scheduler/nextTick';
export default class ConnectableObservable extends Observable {
    constructor(source, subjectFactory) {
        super(null);
        this.source = source;
        this.subjectFactory = subjectFactory;
    }
    connect() {
        return nextTick.schedule(0, this, dispatchConnection);
    }
    connectSync() {
        return dispatchConnection(this);
    }
    [$$observer](observer) {
        if (!(observer instanceof Observer)) {
            observer = new Observer(observer);
        }
        if (!this.subject || this.subject.unsubscribed) {
            if (this.subscription) {
                this.subscription = undefined;
            }
            this.subject = this.subjectFactory();
        }
        return this.subject[$$observer](observer);
    }
    refCount() {
        return new RefCountObservable(this);
    }
}
class RefCountObservable extends Observable {
    constructor(source) {
        super(null);
        this.refCount = 0;
        this.source = source;
    }
    subscriber(observer) {
        this.refCount++;
        this.source[$$observer](observer);
        var shouldConnect = this.refCount === 1;
        if (shouldConnect) {
            this.connectionSubscription = this.source.connectSync();
        }
        return () => {
            var refCount = this.refCount--;
            if (refCount === 0) {
                this.connectionSubscription.unsubscribe();
            }
        };
    }
}
function dispatchConnection(connectable) {
    if (!connectable.subscription) {
        if (!connectable.subject) {
            connectable.subject = connectable.subjectFactory();
        }
        connectable.subscription = connectable.source.subscribe(connectable.subject);
    }
    return connectable.subscription;
}
