import Observable from '../Observable';
import Observer from '../Observer';
import CompositeSubscription from '../CompositeSubscription';
import Subscription from '../Subscription';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
class ZipObservable extends Observable {
    constructor(observables, project) {
        super(null);
        this.observables = observables;
        this.project = project;
    }
    subscriber(observer) {
        var subscriptions = new CompositeSubscription();
        this.observables.forEach((obs, i) => {
            var innerObserver = new InnerZipObserver(observer, i, this.project, subscriptions, obs);
            subscriptions.add(Subscription.from(obs[$$observer](innerObserver), innerObserver));
        });
        return subscriptions;
    }
}
class InnerZipObserver extends Observer {
    constructor(destination, index, project, subscriptions, observable) {
        super(destination);
        this.buffer = [];
        this.index = index;
        this.project = project;
        this.subscriptions = subscriptions;
        this.observable = observable;
    }
    _next(value) {
        this.buffer.push(value);
        return { done: false };
    }
    _canEmit() {
        return this.subscriptions._subscriptions.every(sub => {
            var observer = sub.observer;
            return !observer.unsubscribed && observer.buffer.length > 0;
        });
    }
    _getArgs() {
        return this.subscriptions._subscriptions.reduce((args, sub) => {
            var observer = sub.observer;
            args.push(observer.buffer.shift());
            return args;
        }, []);
    }
    _checkNext() {
        if (this._canEmit()) {
            var args = this._getArgs();
            return this._sendNext(args);
        }
    }
    _sendNext(args) {
        var value = try_catch(this.project).apply(this, args);
        if (value === error_obj) {
            return this.destination["throw"](error_obj.e);
        }
        else {
            return this.destination.next(value);
        }
    }
}
export default function zip(observables, project) {
    return new ZipObservable(observables, project);
}
