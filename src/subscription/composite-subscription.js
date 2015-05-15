import Subscription from './subscription';
export default class CompositeSubscription extends Subscription {
    constructor(...subscriptions) {
        super();
        this._subscriptions = subscriptions;
    }
    add(subscription) {
        this._subscriptions.push(subscription);
        return this;
    }
    remove(subscription) {
        this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
        return this;
    }
    get length() {
        return this._subscriptions.length;
    }
    dispose() {
        while (this._subscriptions.length > 1) {
            var subcription = this._subscriptions.pop();
            subcription.dispose();
        }
        return Subscription.prototype.dispose.call(this);
    }
}
//# sourceMappingURL=composite-subscription.js.map