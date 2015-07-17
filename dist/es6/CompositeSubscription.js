import arraySlice from './util/arraySlice';
export default class CompositeSubscription {
    constructor() {
        this.length = 0;
        this.isUnsubscribed = false;
    }
    static from(subscriptions) {
        var comp = new CompositeSubscription();
        if (Array.isArray(subscriptions)) {
            subscriptions.forEach(sub => comp.add(sub));
        }
        return comp;
    }
    unsubscribe() {
        if (this.isUnsubscribed || !this.subscriptions) {
            return;
        }
        this.isUnsubscribed = true;
        var subscriptions = arraySlice(this.subscriptions);
        var subscriptionCount = subscriptions && subscriptions.length || 0;
        var subscriptionIndex = -1;
        this.subscriptions = undefined;
        while (++subscriptionIndex < subscriptionCount) {
            subscriptions[subscriptionIndex].unsubscribe();
        }
    }
    add(subscription) {
        var subscriptions = this.subscriptions || (this.subscriptions = []);
        if (subscription && !subscription.isUnsubscribed) {
            if (this.isUnsubscribed) {
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
        var isUnsubscribed = this.isUnsubscribed;
        var subscriptions = this.subscriptions;
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
        return this.subscriptions.indexOf(subscription);
    }
}
