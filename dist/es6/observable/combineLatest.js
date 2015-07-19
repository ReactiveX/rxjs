import Observable from '../Observable';
import Subscriber from '../Subscriber';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
class CombineLatestObservable extends Observable {
    constructor(observables, project) {
        super(null);
        this.observables = observables;
        this.project = project;
        this.latestEmissions = new Array(observables.length);
        this.emissionsRemaining = new Array(observables.length);
        for (var i = this.emissionsRemaining.length - 1; i >= 0; i--) {
            this.emissionsRemaining[i] = i;
        }
    }
    subscriber(subscriber) {
        this.observables.forEach((obs, i) => {
            var innerSubscriber = new InnerCombineLatestSubscriber(subscriber, i, this.project, obs, this.latestEmissions, this.emissionsRemaining);
            subscriber.add(obs[$$observer](innerSubscriber));
        });
        return subscriber;
    }
}
class InnerCombineLatestSubscriber extends Subscriber {
    constructor(destination, index, project, observable, latestEmissions, emissionsRemaining) {
        super(destination);
        this.index = index;
        this.project = project;
        this.observable = observable;
        this.latestEmissions = latestEmissions;
        this.emissionsRemaining = emissionsRemaining;
    }
    _next(value) {
        this.latestEmissions[this.index] = value;
        this._updateEmissionsRemaining();
        if (this.emissionsRemaining.length === 0) {
            this._sendNext(this.latestEmissions);
        }
    }
    _updateEmissionsRemaining() {
        var i = this.emissionsRemaining.indexOf(this.index);
        if (i > -1) {
            this.emissionsRemaining.splice(i, 1);
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
export default function combineLatest(observables, project) {
    return new CombineLatestObservable(observables, project);
}
