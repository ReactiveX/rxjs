import Disposable from './Disposable';

var f;

export default class Subscriber extends Disposable {
    
    constructor(onNextOrSubscriber, onError, onCompleted) {
        this.stopped = false;
        if(onNextOrSubscriber && typeof onNextOrSubscriber == 'object') {
            this._onNext = onNextOrSubscriber._onNext || onNextOrSubscriber.next;
            this._onError = onNextOrSubscriber._onError || onNextOrSubscriber.error;
            this._onCompleted = onNextOrSubscriber._onCompleted || onNextOrSubscriber.return;
        } else {
            this._onNext = onNextOrSubscriber;
            this._onError = onError;
            this._onCompleted = onCompleted;
        }
    }
    
    create(n, e, c) {
        var dest = this;
        return new Subscriber(
            n || function(x) { return dest.onNext(x);     },
            e || function(e) { return dest.onError(e);    },
            c || function( ) { return dest.onCompleted(); }
        );
    }
    
    dispose() {
        if(super.dispose()) {
            this.stopped = true;
            delete this._onNext;
            delete this._onError;
            delete this._onCompleted;
            return true;
        }
        return false;
    }
    
    /**
     * Return false to signal unsubscribe, true to keep listening.
     */
    onNext(x) {
        return (
            // If we don't have an _onNext, return `false`.
            (f = this._onNext || false) &&
            // Capture onNext's return value.
            // 
            // 1. If the return value is not `false`, return whether the
            //    onNext function called dispose or not.
            // 2. If the return value is `false`, dispose of the Subscriber
            //    and return false.
            ((f = f.call(this, x) !== false) ? 
                !this.disposed :
                !this.disposed && this.dispose() && false)
        );
    }
    
    /**
     * Return false to signal a successful unsubscribe.
     */
    onError(e) {
        return (
            // If we're already stopped, return `false`.
            (this.stopped === false) &&
            // If we don't have an onError function, return `false`.
            (f = this._onError || false) && (
                // Otherwise, set our stopped flag.
                (this.stopped = true) &&
                // Capture onError's return value.
                // 1. If the return value is not `false`, call dispose and return true.
                // 2. If the return value is `false`, return false.
                (f = f.call(this, e) !== false) && (!!this.dispose() || true))
        );
    }
    
    /**
     * Return false to signal a successful unsubscribe.
     */
    onCompleted() {
        return (
            // If we're already stopped, return `false`.
            (this.stopped === false) &&
            // If we don't have an onCompleted function, return `false`.
            (f = this._onCompleted || false) && (
                // Otherwise, set our stopped flag.
                (this.stopped = true) &&
                // Capture onCompleted's return value.
                // 1. If the return value is not `false`, call dispose and return true.
                // 2. If the return value is `false`, return false.
                (f = f.call(this) !== false) && (!!this.dispose() || true))
        );
    }
    
    next(x)  { return this.onNext(x); }
    error(e) { return this.onError(e); }
    return() { return this.onCompleted(); }
}