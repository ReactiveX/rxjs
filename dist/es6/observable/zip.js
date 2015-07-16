import Observable from '../Observable';
import Subscriber from '../Subscriber';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
class ZipObservable extends Observable {
    constructor(observables, project) {
        super(null);
        this.observables = observables;
        this.project = project;
    }
    subscriber(subscriber) {
        this.observables.forEach((obs, i) => {
            var innerSubscriber = new InnerZipSubscriber(subscriber, i, this.project, obs);
            subscriber.add(obs[$$observer](innerSubscriber));
        });
        return subscriber;
    }
}
class InnerZipSubscriber extends Subscriber {
    constructor(destination, index, project, observable) {
        super(destination);
        this.buffer = [];
        this.index = index;
        this.project = project;
        this.observable = observable;
    }
    _next(value) {
        this.buffer.push(value);
    }
    _canEmit() {
        return this.subscriptions.every(subscription => {
            var sub = subscription;
            return !sub.isUnsubscribed && sub.buffer.length > 0;
        });
    }
    _getArgs() {
        return this.subscriptions.reduce((args, subcription) => {
            var sub = subcription;
            args.push(sub.buffer.shift());
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
            this.destination.error(error_obj.e);
        }
        else {
            this.destination.next(value);
        }
    }
}
export default function zip(observables, project) {
    return new ZipObservable(observables, project);
}
