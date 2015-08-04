import Subject from './Subject';
import Observer from './Observer';
import Operator from './Operator';
import Scheduler from './Scheduler';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import ConnectableObservable from './observables/ConnectableObservable';

import $$observer from './util/Symbol_observer';

export default class Observable<T> {

  source: Observable<any>;
  operator: Operator<any, T>;

  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription<T> | Function | void) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  [$$observer](observer: Observer<T>) {
    return this.subscribe(observer);
  }

  subscribe(observerOrNext?: Observer<T> | ((value: T) => void),
            error?: (error: T) => void,
            complete?: () => void): Subscription<T> {

    let subscriber: Subscriber<T>;

    if (observerOrNext && typeof observerOrNext === "object") {
      if(observerOrNext instanceof Subscriber) {
        subscriber = (<Subscriber<T>> observerOrNext);
      } else {
        subscriber = new Subscriber(<Observer<T>> observerOrNext);
      }
    } else {
      const next = <((x?) => void)> observerOrNext;
      subscriber = Subscriber.create(next, error, complete);
    }

    subscriber.add(this._subscribe(subscriber));

    return subscriber;
  }

  forEach(nextHandler:Function) {
    return new Promise((resolve, reject) => {
      this[$$observer]({
        next: nextHandler,
        error: reject,
        complete: resolve
      });
    });
  }

  _subscribe(subscriber: Observer<any>): Subscription<T> | Function | void {
    return this.source._subscribe(this.operator.call(subscriber));
  }

  // TODO: convert this to an `abstract` class in TypeScript 1.6.

  static defer: <T>(observableFactory: () => Observable<T>) => Observable<T>;
  static from: <T>(iterable: any, project?: (x?: any, i?: number) => T, thisArg?: any, scheduler?: Scheduler) => Observable<T>;
  static fromArray: <T>(array: T[], scheduler?: Scheduler) => Observable<T>;
  // static fromEvent: <T, R>(element: any, eventName: string, selector: (event: R) => T) => Observable<T>;
  static fromEventPattern: <T>(addHandler: (handler:Function)=>void, removeHandler: (handler:Function) => void, selector?: (...args:Array<any>) => T) => Observable<T>;
  static throw: <T>(error: T) => Observable<T>;
  static empty: <T>() => Observable<T>;
  static never: <T>() => Observable<T>;
  static of: <T>(...values: (T | Scheduler)[]) => Observable<T>;
  static range: <T>(start: number, end: number, scheduler?: Scheduler) => Observable<number>;
  static return: <T>(value: T, scheduler?: Scheduler) => Observable<T>;
  static value: <T>(value: T, scheduler?: Scheduler) => Observable<T>;
  static just: <T>(value: T, scheduler?: Scheduler) => Observable<T>;
  static fromPromise: <T>(promise: Promise<T>) => Observable<T>;
  static timer: (delay: number) => Observable<number>;
  static interval: (interval: number) => Observable<number>;

  static concat: (scheduler?: any, ...observables: Observable<any>[]) => Observable<any>;
  concat: (scheduler?: any, ...observables: Observable<any>[]) => Observable<any>;
  concatAll: () => Observable<any>;
  concatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
                 projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  concatMapTo: <R>(observable: Observable<any>,
                   projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;

  static merge: (scheduler?: any, concurrent?: any, ...observables: Observable<any>[]) => Observable<any>;
  merge: (scheduler?: any, concurrent?: any, ...observables: Observable<any>[]) => Observable<any>;
  mergeAll: (concurrent?: any) => Observable<any>;
  flatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
               projectResult?: (x: T, y: any, ix: number, iy: number) => R,
               concurrent?: number) => Observable<R>;
  flatMapTo: <R>(observable: Observable<any>,
                 projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                 concurrent?: number) => Observable<R>;

  switchAll: <R>() => Observable<R>;
  switchLatest: <R>(project: ((x: T, ix: number) => Observable<any>),
                    projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  switchLatestTo: <R>(observable: Observable<any>,
                      projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;

  static combineLatest: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  combineLatest: <R>(...observables: (Observable<any> | ((...values: Array<any>) => R)) []) => Observable<R>;
  combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;

  static zip: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  zip: <R>(...observables: (Observable<any> | ((...values: Array<any>) => R)) []) => Observable<R>;
  zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;

  map: <T, R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  mapTo: <R>(value: R) => Observable<R>;
  toArray: () => Observable<T[]>;
  scan: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  reduce: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;

  filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  skip: (count: number) => Observable<T>;
  take: (count: number) => Observable<T>;
  takeUntil: (observable: Observable<any>) => Observable<T>;
  partition: (predicate: (x: T) => boolean) => Observable<T>[];

  observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;

  publish: () => ConnectableObservable<T>;
  multicast: (subjectFactory: () => Subject<T>) => ConnectableObservable<T>;
  
  catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
}
