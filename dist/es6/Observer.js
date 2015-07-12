export default class Observer {
    constructor(destination) {
        this.unsubscribed = false;
        this.destination = destination;
    }
    static create(_next, _error = null, _completed = null) {
        var observer = new Observer(null);
        observer._next = _next;
        if (_error) {
            observer._error = _error;
        }
        if (_completed) {
            observer._completed = _completed;
        }
        return observer;
    }
    _next(value) {
        this.destination.next(value);
    }
    _error(error) {
        var destination = this.destination;
        if (destination && destination.error) {
            destination.error(error);
        }
        else {
            throw error;
        }
    }
    _completed(value) {
        var destination = this.destination;
        if (destination && destination.complete) {
            destination.complete(value);
        }
    }
    next(value) {
        if (this.unsubscribed) {
            return;
        }
        this._next(value);
    }
    error(error) {
        if (this.unsubscribed) {
            return;
        }
        var result = this._error(error);
        this.unsubscribe();
    }
    complete(value = undefined) {
        if (this.unsubscribed) {
            return;
        }
        var result = this._completed(value);
        this.unsubscribe();
    }
    unsubscribe() {
        this.unsubscribed = true;
    }
}
