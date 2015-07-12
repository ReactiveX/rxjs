import Observer from '../Observer';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import $$observer from '../util/Symbol_observer';
import ObserverFactory from '../ObserverFactory';
class MergeAllObserver extends Observer {
    constructor(destination, concurrent) {
        super(destination);
        this.stopped = false;
        this.buffer = [];
        this.concurrent = concurrent;
        this.subscriptions = new CompositeSubscription();
    }
    next(observable) {
        var buffer = this.buffer;
        var concurrent = this.concurrent;
        var subscriptions = this.subscriptions;
        if (subscriptions.length < concurrent) {
            var innerSubscription = new SerialSubscription(null);
            var innerObserver = new MergeInnerObserver(this, innerSubscription);
            subscriptions.add(innerSubscription);
            innerSubscription.add(observable[$$observer](innerObserver));
        }
        else if (buffer) {
            buffer.push(observable);
        }
    }
    complete(value) {
        this.stopped = true;
        if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
            this.destination.complete(value);
        }
    }
    _innerComplete(innerObserver) {
        var buffer = this.buffer;
        var subscriptions = this.subscriptions;
        subscriptions.remove(innerObserver.subscription);
        if (subscriptions.length < this.concurrent) {
            if (buffer && buffer.length > 0) {
                this.next(buffer.shift());
            }
            else if (this.stopped && subscriptions.length === 0) {
                return this.destination.complete();
            }
        }
    }
    unsubscribe() {
        super.unsubscribe();
        this.subscriptions.unsubscribe();
    }
}
class MergeInnerObserver extends Observer {
    constructor(parent, subscription) {
        super(parent.destination);
        this.parent = parent;
        this.subscription = subscription;
    }
    _complete(value) {
        return this.parent._innerComplete(this);
    }
}
class MergeAllObserverFactory extends ObserverFactory {
    constructor(concurrent) {
        super();
        this.concurrent = concurrent;
    }
    create(destination) {
        return new MergeAllObserver(destination, this.concurrent);
    }
}
export default function mergeAll(concurrent = Number.POSITIVE_INFINITY) {
    return this.lift(new MergeAllObserverFactory(concurrent));
}
;
