export default class Subscription {
    constructor(_unsubscribe, observer) {
        this.length = 0;
        this.unsubscribed = false;
        this._unsubscribe = _unsubscribe;
        this.observer = observer;
        if (observer) {
            observer.setSubscription(this);
        }
    }
    unsubscribe() {
        if (this.unsubscribed) {
            return;
        }
        this.unsubscribed = true;
        var unsubscribe = this._unsubscribe;
        if (unsubscribe) {
            this._unsubscribe = undefined;
            unsubscribe.call(this);
        }
        var observer = this.observer;
        if (observer) {
            this.observer = undefined;
            if (observer.dispose && observer._dispose) {
                observer.dispose();
            }
            else if (observer.return && observer._return) {
                observer.return();
            }
        }
    }
    add(subscription) {
        return this;
    }
    remove(subscription) {
        return this;
    }
    static from(value, observer) {
        if (!value) {
            return new Subscription(undefined, observer);
        }
        else if (value && typeof value.unsubscribe === 'function') {
            return value;
        }
        else if (typeof value === 'function') {
            return new Subscription(value, observer);
        }
    }
}
