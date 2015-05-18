import Subscription from './subscription';
export default class SubscriptionReference extends Subscription {
    constructor(subscription = null) {
        super(null);
        this.isReference = true;
        this.subscription = subscription;
        this._isDisposeScheduled = false;
        this._isDisposed = false;
    }
    get value() {
        return this.subscription;
    }
    set value(subcription) {
        this.setSubscription(subcription);
    }
    get isDisposed() {
        return this._isDisposeScheduled || this._isDisposed;
    }
    setSubscription(subscription) {
        this.subscription = subscription;
        if (this._isDisposeScheduled) {
            this._dispose();
        }
    }
    _dispose() {
        this.subscription.dispose();
        this._isDisposeScheduled = false;
        this._isDisposed = true;
    }
    dispose() {
        if (!this.subscription) {
            this._isDisposeScheduled = true;
        }
        else {
            this._dispose();
        }
    }
}
//# sourceMappingURL=subscription-reference.js.map