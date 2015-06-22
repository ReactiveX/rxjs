import Subscription from './Subscription';
export default class SerialSubscription extends Subscription {
    constructor(subscription) {
        super(null, null);
        this.subscription = subscription;
    }
    add(subscription) {
        if (subscription) {
            if (this.unsubscribed) {
                subscription.unsubscribe();
            }
            else {
                var currentSubscription = this.subscription;
                this.subscription = subscription;
                if (currentSubscription) {
                    currentSubscription.unsubscribe();
                }
            }
        }
        return this;
    }
    remove(subscription) {
        if (this.subscription === subscription) {
            this.subscription = undefined;
        }
        return this;
    }
    unsubscribe() {
        if (this.unsubscribed) {
            return;
        }
        this.unsubscribed = true;
        var subscription = this.subscription;
        if (subscription) {
            this.subscription = undefined;
            subscription.unsubscribe();
        }
    }
}
