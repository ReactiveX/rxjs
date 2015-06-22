import Observer from '../Observer';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
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
        return { done: false };
    }
    return() {
        this.stopped = true;
        if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
            this.destination.return();
        }
        return { done: true };
    }
    _innerReturn(innerObserver) {
        var buffer = this.buffer;
        var subscriptions = this.subscriptions;
        subscriptions.remove(innerObserver.subscription);
        if (subscriptions.length < this.concurrent) {
            if (buffer && buffer.length > 0) {
                this.next(buffer.shift());
            }
            else if (this.stopped && subscriptions.length === 0) {
                return this.destination.return();
            }
        }
        return { done: true };
    }
    _dispose() {
        console.log('dispose parent');
        this.subscriptions.unsubscribe();
    }
}
class MergeInnerObserver extends Observer {
    constructor(parent, subscription) {
        super(parent.destination);
        this.parent = parent;
        this.subscription = subscription;
    }
    _return() {
        return this.parent._innerReturn(this);
    }
}
class MergeAllObservable extends Observable {
    constructor(source, concurrent) {
        super(null);
        this.source = source;
        this.concurrent = concurrent;
    }
    subscriber(observer) {
        var mergeAllObserver = new MergeAllObserver(observer, this.concurrent);
        return Subscription.from(this.source.subscriber(mergeAllObserver), mergeAllObserver);
    }
}
export default function mergeAll(concurrent = Number.POSITIVE_INFINITY) {
    return new MergeAllObservable(this, concurrent);
}
;
