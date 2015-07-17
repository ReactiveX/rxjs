import Subscriber from '../Subscriber';
import $$observer from '../util/Symbol_observer';
import SubscriberFactory from '../SubscriberFactory';
class MergeAllSubscriber extends Subscriber {
    constructor(destination, concurrent) {
        super(destination);
        this.stopped = false;
        this.buffer = [];
        this.concurrent = concurrent;
    }
    next(observable) {
        var buffer = this.buffer;
        var concurrent = this.concurrent;
        var subscriptions = this.subscriptions;
        if (subscriptions.length < concurrent) {
            var innerSubscriber = new MergeInnerSubscriber(this);
            this.add(innerSubscriber);
            innerSubscriber.add(observable[$$observer](innerSubscriber));
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
    _innerComplete(innerSubscriber) {
        var buffer = this.buffer;
        this.remove(innerSubscriber);
        if (this.subscriptions.length < this.concurrent) {
            if (buffer && buffer.length > 0) {
                this.next(buffer.shift());
            }
            else if (this.stopped && this.subscriptions.length === 0) {
                return this.destination.complete();
            }
        }
    }
}
class MergeInnerSubscriber extends Subscriber {
    constructor(parent) {
        super(parent.destination);
        this.parent = parent;
    }
    _complete(value) {
        return this.parent._innerComplete(this);
    }
}
class MergeAllSubscriberFactory extends SubscriberFactory {
    constructor(concurrent) {
        super();
        this.concurrent = concurrent;
    }
    create(destination) {
        return new MergeAllSubscriber(destination, this.concurrent);
    }
}
export default function mergeAll(concurrent = Number.POSITIVE_INFINITY) {
    return this.lift(new MergeAllSubscriberFactory(concurrent));
}
;
