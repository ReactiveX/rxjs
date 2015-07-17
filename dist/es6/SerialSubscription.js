export default class SerialSubscription {
    constructor(subscription) {
        this.isUnsubscribed = false;
        this.subscription = subscription;
    }
    add(subscription) {
        if (subscription) {
            if (this.isUnsubscribed) {
                subscription.unsubscribe();
            }
            else {
                let currentSubscription = this.subscription;
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
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            let subscription = this.subscription;
            if (subscription) {
                this.subscription = undefined;
                subscription.unsubscribe();
            }
        }
    }
}
