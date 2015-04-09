import Observer from '../observer/observer';
import MapObserver from '../observer/map-observer';
import SubscriptionReference from '../subscription/subscription-reference';
import CompositeSubscriptionReference from '../subscription/composite-subscription-reference';
import CompositeSubscription from '../subscription/composite-subscription';
import MergeAllObserver from '../observer/merge-all-observer';
import Subscription from '../subscription/subscription';
import currentFrameScheduler from '../scheduler/global/current-frame';

function noop() {}

export class Observable {
  constructor(observer, scheduler) {
    this._observer = observer;
    this._scheduler = scheduler || currentFrameScheduler;
  }
  
  observer(generator) {
    var subref = new SubscriptionReference();
    var state = {
      source: this,
      generator: new Observer(generator, subref),
      subscriptionReference: subref
    };

    this._scheduler.schedule(state, this.scheduledObservation);

    return state.subscriptionReference;
  }

  scheduledObservation(scheduler, state) {
    var result = state.source._observer(state.generator);

    var subscription;
    switch(typeof result) {
      case 'undefined':
        subscription = new Subscription(noop);
        break;

      case 'function':
        subscription = new Subscription(result);
        break;

      default:
        subscription = result;
        break;
    }

    state.subscriptionReference.setSubscription(subscription);
  }

  // Observable/Observer pair methods
  map(projection) {
    return new MapObservable(this, projection);
  }

  flatMap(projection) {
    return this.map(projection).mergeAll();
  }

  mergeAll() {
    return new MergeAllObservable(this);
  }
}

Observable.return = function(value) {
  return new Observable((generator) => {
    generator.next(value);
    generator.return(value);
  });
};


export class MergeAllObservable extends Observable {
  constructor(source) {
    super(this._observer);
    this._source = source;
  }

  _observer(generator) {
    var subscriptionReference = new SubscriptionReference();
    subscriptionReference.setSubscription(this._source.observer(new MergeAllObserver(generator, subscriptionReference)));
    return subscriptionReference.value;
  }
}

export class MapObservable extends Observable {
  constructor(source, projection) {
    super(this._observer);
    this._projection = projection;
    this._source = source;
  }
  
  _observer(generator) {
    var subscriptionReference = new SubscriptionReference();
    subscriptionReference.setSubscription(this._source.observer(new MapObserver(this._projection, generator, subscriptionReference)));
    return subscriptionReference.value;
  }
}
