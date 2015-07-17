export default class Subscriber {
    constructor(destination) {
        this.isUnsubscribed = false;
        this.subscriptions = [];
        this.destination = destination;
    }
    next(value) {
        if (!this.isUnsubscribed) {
            this._next(value);
        }
    }
    _next(value) {
        if (this.destination) {
            this.destination.next(value);
        }
    }
    error(err) {
        if (!this.isUnsubscribed) {
            this._error(err);
            this.unsubscribe();
        }
    }
    _error(err) {
        let destination = this.destination;
        if (destination && destination.error) {
            destination.error(err);
        }
        else {
            throw err;
        }
    }
    complete(value = undefined) {
        if (!this.isUnsubscribed) {
            this._complete(value);
            this.unsubscribe();
        }
    }
    _complete(value) {
        let destination = this.destination;
        if (destination && destination.complete) {
            destination.complete(value);
        }
    }
    subscribe(subscription) {
        this._subscribe(subscription);
    }
    _subscribe(subscription) {
        let destination = this.destination;
        if (destination && destination.subscribe) {
            destination.subscribe(subscription);
        }
    }
    unsubscribe() {
        this.isUnsubscribed = true;
        while (this.subscriptions.length > 0) {
            var sub = this.subscriptions.shift();
            sub.unsubscribe();
        }
    }
    add(subscriptionOrAction) {
        if (!subscriptionOrAction) {
            return;
        }
        let subscription = (typeof subscriptionOrAction === 'function' ?
            { unsubscribe: subscriptionOrAction } :
            subscriptionOrAction);
        if (this.isUnsubscribed) {
            subscription.unsubscribe();
        }
        else if (typeof subscription.unsubscribe === 'function') {
            this.subscriptions.push(subscription);
        }
    }
    remove(subscription) {
        var index = this.subscriptions.indexOf(subscription);
        if (index !== -1) {
            this.subscriptions.splice(index, 1);
        }
    }
}
