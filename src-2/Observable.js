import Disposable from './Disposable';
import Subscriber from './Subscriber';

class Observable {
    
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    
    subscribe(n, e, c) {
        if(n instanceof Subscriber) {
            return fixDisposable(this._subscribe(n));
        } else if(n && typeof n == 'object') {
            if(!!n.onNext) {
                return fixDisposable(this._subscribe(new Subscriber(n.onNext, n.onError, n.onCompleted)));
            } else {
                return fixDisposable(this._subscribe(new Subscriber(n.next, n.throw, n.return)));
            }
        } else {
            return fixDisposable(this._subscribe(new Subscriber(n, e, c)));
        }
    }
    
    create(subscribe) {
        return new Observable(subscribe);
    }
    
    time_lift(transform) {
        var obs = this;
        return this.create(function(destination) {
            return obs.subscribe(transform(destination));
        });
    }
    
    space_lift(transform) {
        var obs = this.create(space_subscribe);
        obs.source = this;
        obs.transform = transform;
        return obs;
    }
}

// Observable.prototype.lift = Observable.prototype.time_lift;
Observable.prototype.lift = Observable.prototype.space_lift;
Observable.prototype.forEach = Observable.prototype.subscribe;
Observable.prototype.observer = Observable.prototype.subscribe;

function space_subscribe(destination) {
    return this.source._subscribe(this.transform(destination));
}

function fixDisposable(upstream) {
    switch(typeof upstream) {
        case 'function':
            return new Disposable(upstream);
        case 'object':
            return upstream || Disposable.empty;
        case 'undefined':
        case 'number':
        case 'string':
        case 'boolean':
            return Disposable.empty;
        default:
            return upstream;
    }
}

export default Observable;