import Observer from './observer';
import CompositeSubscription from '../subscription/composite-subscription';
import SubscriptionReference from '../subscription/subscription-reference';
export default class MergeAllObserver extends Observer {
    constructor(generator, subscription) {
        super(generator, subscription);
        this._compositeSubscription = new CompositeSubscription();
    }
    completed(subscription) {
        this._compositeSubscription.remove(subscription);
        return this.checkReturn();
    }
    checkReturn() {
        if (this.canReturn && this._compositeSubscription.length === 0) {
            return this.generator.return(this.returnValue);
        }
    }
    next(observable) {
        var subscription = new SubscriptionReference();
        this._compositeSubscription.add(subscription);
        var sub;
        try {
            sub = observable.observer(new MergedObservableObserver(this, subscription));
        }
        catch (err) {
            super.throw(err);
        }
        subscription.setSubscription(sub);
        return { done: false, value: undefined };
    }
    return(value) {
        this.canReturn = true;
        this.returnValue = value;
        return this.checkReturn();
    }
}
export class MergedObservableObserver extends Observer {
    constructor(source, subscription) {
        super(source._generator, subscription);
        this._source = source;
    }
    return() {
        return this._source.completed(this.subscription);
    }
}
//# sourceMappingURL=merge-all-observer.js.map