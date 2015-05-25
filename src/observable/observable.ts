import Observer from '../observer/observer';
import MapObserver from '../observer/map-observer';
import SubscriptionReference from '../subscription/subscription-reference';
import MergeAllObserver from '../observer/merge-all-observer';
import Subscription from '../subscription/subscription';
import currentFrameScheduler from '../scheduler/global/current-frame';
import ScheduledObserver from '../observer/scheduled-observer';
import Scheduler from '../scheduler/scheduler';
import noop from '../util/noop';

export class Observable<T> {

  protected _observer: (generator:Generator<any>) => void|Subscription|Function;

  protected _scheduler: Scheduler;

  static return<T>(value:T) : Observable<T> {
    return Observable.create(generator => {
      generator.next(value);
      generator.return(value);
    });
  }
  
  static create<T>(observer: (generator:Generator<any>) => void|Subscription|Function) {
    return new Observable<T>(observer);
  }

  constructor(observer: (generator:Generator<any>) => void|Subscription|Function = noop, scheduler:Scheduler=currentFrameScheduler) {
    this._observer = observer;
    this._scheduler = scheduler || currentFrameScheduler;
  }
  
  observer(generator:Generator<T>) {
    var subref = new SubscriptionReference();
    var state = {
      source: this,
      generator: new Observer(generator, subref),
      subscription: subref
    };

    this._scheduler.schedule(0, state, this.scheduledObservation);

    return state.subscription;
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

    state.subscription.setSubscription(subscription);
  }

  // Observable/Observer pair methods
  map<R>(projection:(any) => R) : MapObservable<R> {
    return new MapObservable<R>(this, projection);
  }

  flatMap<R>(projection:(any) => Observable<R>) : MergeAllObservable<R>{
    return this.map(projection).mergeAll();
  }

  mergeAll<R>() : MergeAllObservable<R> {
    return new MergeAllObservable<R>(this);
  }

  observeOn<R>(observationScheduler:Scheduler) : ScheduledObservable<R> {
    return new ScheduledObservable<R>(this, observationScheduler);
  }
}

export class ScheduledObservable<T> extends Observable<T> {
  private _observationScheduler:Scheduler
  private _source:Observable<any>

  constructor(source:Observable<any>, observationScheduler:Scheduler) {
    super();
    this._observationScheduler = observationScheduler;
    this._source = source;
  }
  
  _observer = function(generator:Generator<any>) : Subscription {
    var subscription = new SubscriptionReference();
    subscription.setSubscription(this._source.observer(new ScheduledObserver<T>(this._observationScheduler, generator, subscription)));
    return subscription.value;
  }
}

export class MergeAllObservable<T> extends Observable<T> {
  private _source:Observable<T>

  constructor(source) {
    super();
    this._source = source;
  }

  _observer = function(generator:Generator<any>) : Subscription {
    var subscription = new SubscriptionReference();
    subscription.setSubscription(this._source.observer(new MergeAllObserver<T>(generator, subscription)));
    return subscription.value;
  }
}

export class MapObservable<T> extends Observable<T> {
  private _projection:(any) => T;
  
  private _source:Observable<any>;

  constructor(source:Observable<any>, projection:(any) => T) {
    super();
    this._projection = projection;
    this._source = source;
  }
  
  _observer = function(generator:Generator<any>) : Subscription {
    var subscription = new SubscriptionReference();
    subscription.setSubscription(this._source.observer(new MapObserver<T>(this._projection, generator, subscription)));
    return subscription.value;
  }
}