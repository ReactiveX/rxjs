import Observer from './Observer';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';
import nextTick from './scheduler/nextTick';
import $$observer from './util/Symbol_observer';
import Scheduler from './scheduler/Scheduler';
import Subject from './Subject';
import ConnectableObservable from './ConnectableObservable';
import ObserverFactory from './ObserverFactory';

export default class Observable {
  static value: (value: any) => Observable;
  static return: (returnValue: any) => Observable;
  static fromEvent: (element: any, eventName: string, selector: Function) => Observable;
  static fromEventPattern: (addHandler: Function, removeHandler: Function, selector: Function) => Observable;
  static throw: (err: any) => Observable;
  static empty: () => Observable;
  static never: () => Observable;
  static range: (start: number, end: number) => Observable;
  static fromArray: (array: Array<any>) => Observable;
  static zip: (observables: Array<Observable>, project: (...observables: Array<Observable>) => Observable) => Observable;
  static fromPromise: (promise: Promise<any>) => Observable;
  static of: (...values: Array<any>) => Observable;
  static timer: (delay: number) => Observable;
  static interval: (interval: number) => Observable;

  filter: (predicate: (any) => boolean) => Observable;
  map: (project: (any) => any) => Observable;
  mapTo: (value: any) => Observable;
  mergeAll: (concurrent?: number) => Observable;
  flatMap: (project: any, concurrent?: number) => Observable;
  concatAll: () => Observable;
  skip: (count: number) => Observable;
  take: (count: number) => Observable;
  subscribeOn: (scheduler: Scheduler) => Observable;
  observeOn: (scheduler: Scheduler) => Observable;
  zipAll: (project: (...observables: Array<Observable>) => Observable) => Observable;
  zip: (observables: Array<Observable>, project: (...observables: Array<Observable>) => Observable) => Observable;
  merge: (observables: Array<Observable>) => Observable;
  toArray: () => Observable;
  multicast: (subjectFactory: () => Subject) => ConnectableObservable;
  publish: () => ConnectableObservable;
  reduce: (processor: (accum: any, value: any) => any, initialValue: any) => Observable;
  
  source: Observable = null;
  observerFactory: ObserverFactory = new ObserverFactory();
  
  constructor(subscriber=null) {
    if (subscriber) {
      this.subscriber = subscriber;
    }
  }

  static create(subscriber: (observer: Observer) => any): Observable {
    return new Observable(subscriber);
  }

  subscriber(observer: Observer): Subscription|Function|void {
    return this.source.subscribe(this.observerFactory.create(observer));
  }
  
  lift(observerFactory: ObserverFactory): Observable {
    var observable = new Observable();
    observable.source = this;
    observable.observerFactory = observerFactory;
    return observable;
  }

  [$$observer](observer: Observer) {
    if (!(observer instanceof Observer)) {
      observer = new Observer(observer);
    }
    return Subscription.from(this.subscriber(observer), observer);
  }

  subscribe(observerOrNext, error=null, complete=null):Subscription {
    let observer;

    if (typeof observerOrNext === 'object') {
      observer = observerOrNext;
    } else {
      observer = Observer.create(<(any) => void>observerOrNext, error, complete);
    }

    return this[$$observer](observer);
  }

  forEach(nextHandler) {
    return new Promise((resolve, reject) => {
      let observer = Observer.create((value) => {
        nextHandler(value);
        return { done: false };
      }, (err) => {
        reject(err);
        return { done: true };
      }, (value) => {
        resolve(value);
        return { done: true };
      });
      this[$$observer](observer);
    });
  }
}

function dispatchSubscription([observer, observable]) {
  return observable[$$observer](observer);
}