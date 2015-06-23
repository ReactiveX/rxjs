export default class Observer {
    constructor(destination) {
        this.unsubscribed = false;
        this.destination = destination;
    }
    static create(_next, _throw = null, _return = null, _dispose = null) {
        var observer = new Observer(null);
        observer._next = _next;
        if (_throw) {
            observer._throw = _throw;
        }
        if (_return) {
            observer._return = _return;
        }
        if (_dispose) {
            observer._dispose = _dispose;
        }
        return observer;
    }
    _dispose() {
        var destination = this.destination;
        if (destination && destination.dispose) {
            destination.dispose();
        }
    }
    _next(value) {
        return this.destination.next(value);
    }
    _throw(error) {
        var destination = this.destination;
        if (destination && destination.throw) {
            return destination.throw(error);
        }
        else {
            throw error;
        }
    }
    _return(value) {
        var destination = this.destination;
        if (destination && destination.return) {
            return destination.return(value);
        }
        else {
            return { done: true };
        }
    }
    next(value) {
        if (this.unsubscribed) {
            return { done: true };
        }
        var result = this._next(value);
        result = result || { done: false };
        if (result.done) {
            this.unsubscribe();
        }
        return result;
    }
    throw(error) {
        if (this.unsubscribed) {
            return { done: true };
        }
        var result = this._throw(error);
        this.unsubscribe();
        return { done: true, value: result ? result.value : undefined };
    }
    return(value = undefined) {
        if (this.unsubscribed) {
            return { done: true };
        }
        var result = this._return(value);
        this.unsubscribe();
        return { done: true, value: result ? result.value : undefined };
    }
    unsubscribe() {
        this.unsubscribed = true;
        if (this.subscription && this.subscription._unsubscribe) {
            this.subscription._unsubscribe();
        }
    }
    setSubscription(subscription) {
        this.subscription = subscription;
        if (this.unsubscribed && subscription._unsubscribe) {
            subscription._unsubscribe();
        }
    }
    dispose() {
        if (!this.unsubscribed) {
            if (this._dispose) {
                this._dispose();
            }
        }
        this.unsubscribe();
    }
}
