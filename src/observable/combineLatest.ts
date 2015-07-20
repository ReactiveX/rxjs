import Observable from '../Observable';
import Subscriber from '../Subscriber';
import CompositeSubscription from '../CompositeSubscription';
import SerialSubscription from '../SerialSubscription';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import { Subscription } from '../Subscription';

class CombineLatestObservable extends Observable {
  observables: Array<Observable>;
  project: (...observables: Array<Observable>) => Observable;
  latestEmissions: Array<any>;
  emissionsRemaining: Array<number>;

  constructor(
  observables: Array<Observable>,
  project: (...observables: Array<Observable>) => Observable) {
    super(null);
    this.observables = observables;
    this.project = project;
    this.latestEmissions = new Array(observables.length);
    this.emissionsRemaining = new Array(observables.length);
    for (var i = this.emissionsRemaining.length - 1; i >= 0; i--) {
      this.emissionsRemaining[i] = i;
    }
  }

  subscriber(subscriber: Subscriber): Subscription {
    this.observables.forEach((obs, i) => {
      var innerSubscriber = new InnerCombineLatestSubscriber(
        subscriber, 
        i, 
        this.project, 
        obs, 
        this.latestEmissions, 
        this.emissionsRemaining
      );
      subscriber.add(obs[$$observer](innerSubscriber));
    });
    return subscriber;
  }
}

class InnerCombineLatestSubscriber extends Subscriber {
  index: number;
  project: (...observer: Array<Observable>) => Observable;
  observable: Observable;
  latestEmissions: Array<any>;
  emissionsRemaining: Array<number>;

  constructor(
  destination: Subscriber, 
  index: number,
  project: (...observables: Array<Observable>) => Observable,
  observable: Observable,
  latestEmissions: Array<any>,
  emissionsRemaining: Array<number>) {
    super(destination);
    this.index = index;
    this.project = project;
    this.observable = observable;
    this.latestEmissions = latestEmissions;
    this.emissionsRemaining = emissionsRemaining;
  }

  _next(value: any) {
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

  _sendNext(args: Array<any>) {
    var value = try_catch(this.project).apply(this, args);
    if(value === error_obj) {
      this.destination.error(error_obj.e);
    } else {
      this.destination.next(value);
    }
  }
}

export default function combineLatest(
observables: Array<Observable>,
project: (...observables: Array<Observable>) => Observable): Observable {
  return new CombineLatestObservable(observables, project);
}