import Subscription from './Subscription';
import arraySlice from './util/arraySlice';
export default class CompositeSubscription extends Subscription {
    constructor() {
        super(null, null);
        this.length = 0;
    }
    static from(subscriptions) {
        var comp = new CompositeSubscription();
        if (Array.isArray(subscriptions)) {
            subscriptions.forEach(sub => comp.add(sub));
        }
        return comp;
    }
    unsubscribe() {
        if (this.unsubscribed || !this._subscriptions) {
            return;
        }
        this.unsubscribed = true;
        var subscriptions = arraySlice(this._subscriptions);
        var subscriptionCount = subscriptions && subscriptions.length || 0;
        var subscriptionIndex = -1;
        this._subscriptions = undefined;
        while (++subscriptionIndex < subscriptionCount) {
            subscriptions[subscriptionIndex].unsubscribe();
        }
    }
    add(subscription) {
        var subscriptions = this._subscriptions || (this._subscriptions = []);
        if (subscription && !subscription.unsubscribed) {
            if (this.unsubscribed) {
                subscription.unsubscribe();
            }
            else {
                subscriptions.push(subscription);
            }
        }
        this.length = subscriptions.length;
        return this;
    }
    remove(subscription) {
        var unsubscribed = this.unsubscribed;
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
            this.length = subscriptions.length;
        }
        else {
            this.length = 0;
        }
        return this;
    }
    indexOf(subscription) {
        return this._subscriptions.indexOf(subscription);
    }
}
