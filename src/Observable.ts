import Observer from './Observer';
import Operator from './Operator';
import Scheduler from './Scheduler';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import { root } from './util/root';
import { CoreOperators } from './CoreOperators';
import $$observable from './util/Symbol_observable';
import { GroupedObservable } from './operators/groupBy-support';
import ConnectableObservable from './observables/ConnectableObservable';
import Subject from './Subject';

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export default class Observable<T> implements CoreOperators<T>  {
  source: Observable<any>;
  operator: Operator<any, T>;
  _isScalar: boolean = false;

  /**
   * @constructor
   * @param {Function} subscribe the function that is
   * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
   * of a successful completion.
   */
  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription<T>|Function|void) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * @static
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @returns {Observable} a new cold observable
   * @description creates a new cold Observable by calling the Observable constructor
   */
  static create: Function = <T>(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription<T>|Function|void) => {
    return new Observable<T>(subscribe);
  };

  /**
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @returns {Observable} a new observable with the Operator applied
   * @description creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   */
  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  /**
   * @method Symbol.observable
   * @returns {Observable} this instance of the observable
   * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   */
  [$$observable]() {
    return this;
  }

  /**
   * @method subscribe
   * @param {Observer|Function} observerOrNext (optional) either an observer defining all functions to be called,
   *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
   * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
   *  the error will be thrown as unhandled
   * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
   * @returns {Subscription} a subscription reference to the registered handlers
   * @description registers handlers for handling emitted values, error and completions from the observable, and
   *  executes the observable's subscriber function, which will take action to set up the underlying data stream
   */
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

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {PromiseConstructor} PromiseCtor? a constructor function used to instantiate the Promise
   * @returns {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next:(value:T) => void, PromiseCtor?: PromiseConstructor): Promise<void> {
    if(!PromiseCtor) {
      if(root.Rx && root.Rx.config && root.Rx.config.Promise) {
        PromiseCtor = root.Rx.config.Promise;
      } else if (root.Promise) {
        PromiseCtor = root.Promise;
      }
    }

    if(!PromiseCtor) {
      throw new Error('no Promise impl found');
    }

    return new PromiseCtor<void>((resolve, reject) => {
      this.subscribe(next, reject, resolve);
    });
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> | Function | void {
    return this.source._subscribe(this.operator.call(subscriber));
  }

  // static method stubs
  static combineLatest: <T>(...observables: Array<Observable<any> | ((...values: Array<any>) => T) | Scheduler>) => Observable<T>;
  static concat: <T>(...observables: Array<Observable<any> | Scheduler>) => Observable<T>;
  static defer: <T>(observableFactory: () => Observable<T>) => Observable<T>;
  static empty: <T>(scheduler?: Scheduler) => Observable<T>;
  static forkJoin: <T>(...observables: Observable<any>[]) => Observable<T>;
  static from: <T>(iterable: any, scheduler?: Scheduler) => Observable<T>;
  static fromArray: <T>(array: T[], scheduler?: Scheduler) => Observable<T>;
  static fromEvent: <T>(element: any, eventName: string, selector?: (...args:Array<any>) => T) => Observable<T>;
  static fromEventPattern: <T>(addHandler: (handler:Function)=>void, removeHandler: (handler:Function) => void, selector?: (...args:Array<any>) => T) => Observable<T>;
  static fromPromise: <T>(promise: Promise<T>, scheduler?: Scheduler) => Observable<T>;
  static interval: (interval: number, scheduler?: Scheduler) => Observable<number>;
  static merge: <T>(...observables: Array<Observable<any> | Scheduler | number>) => Observable<T>;
  static never: <T>() => Observable<T>;
  static of: <T>(...values: Array<T | Scheduler>) => Observable<T>;
  static range: (start: number, end: number, scheduler?: Scheduler) => Observable<number>;
  static throw: <T>(error: T) => Observable<T>;
  static timer: (dueTime: number, period?: number | Scheduler, scheduler?: Scheduler) => Observable<number>;
  static zip: <T>(...observables: Array<Observable<any> | ((...values: Array<any>) => T)>) => Observable<T>;

  // core operators

  buffer: <T>(closingNotifier: Observable<any>) => Observable<T[]>;
  bufferCount: <T>(bufferSize: number, startBufferEvery: number) => Observable<T[]>;
  bufferTime: <T>(bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
  bufferToggle: <T, O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>;
  bufferWhen: <T>(closingSelector: () => Observable<any>) => Observable<T[]>;
  catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
  combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
  combineLatest: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  concat: (...observables: any[]) => Observable<any>;
  concatAll: () => Observable<any>;
  concatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  concatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  count: () => Observable<number>;
  dematerialize: () => Observable<any>;
  debounce: <T>(durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  debounceTime: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
  defaultIfEmpty: <T, R>(defaultValue: R) => Observable<T> | Observable<R>;
  delay: <T>(delay: number, scheduler?: Scheduler) => Observable<T>;
  distinctUntilChanged: (compare?: (x: T, y: T) => boolean, thisArg?: any) => Observable<T>;
  do: <T>(next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
  expand: (project: (x: T, ix: number) => Observable<any>) => Observable<any>;
  filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  finally: (ensure: () => void, thisArg?: any) => Observable<T>;
  first: <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) => Observable<R>;
  flatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  flatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  groupBy: <T, R>(keySelector: (value: T) => string, elementSelector?: (value: T) => R, durationSelector?: (group: GroupedObservable<R>) => Observable<any>) => Observable<GroupedObservable<R>>;
  ignoreElements: () => Observable<T>;
  last: <R>(predicate?: (value: T, index: number) => boolean, resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) => Observable<T>;
  every: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  map: <T, R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  mapTo: <R>(value: R) => Observable<R>;
  materialize: () => Observable<any>;
  merge: (...observables: any[]) => Observable<any>;
  mergeAll: (concurrent?: any) => Observable<any>;
  mergeMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  mergeMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  multicast: (subjectFactory: () => Subject<T>) => ConnectableObservable<T>;
  observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  partition: (predicate: (x: T) => boolean) => Observable<T>[];
  publish: () => ConnectableObservable<T>;
  publishBehavior: (value: any) => ConnectableObservable<T>;
  publishReplay: (bufferSize: number, windowTime: number, scheduler?: Scheduler) => ConnectableObservable<T>;
  reduce: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  repeat: <T>(count: number) => Observable<T>;
  retry: <T>(count: number) => Observable<T>;
  retryWhen: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
  sample: <T>(notifier: Observable<any>) => Observable<T>;
  sampleTime: <T>(delay: number, scheduler?: Scheduler) => Observable<T>;
  scan: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  share: () => Observable<T>;
  shareReplay: (bufferSize: number, windowTime: number, scheduler?: Scheduler) => Observable<T>;
  single: (predicate?: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  skip: (count: number) => Observable<T>;
  skipUntil: (notifier: Observable<any>) => Observable<T>;
  startWith: <T>(x: T) => Observable<T>;
  subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  switch: <R>() => Observable<R>;
  switchMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  switchMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  take: (count: number) => Observable<T>;
  takeUntil: (observable: Observable<any>) => Observable<T>;
  throttle: (delay: number, scheduler?: Scheduler) => Observable<T>;
  timeout: <T>(due: number | Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
  timeoutWith: <T>(due: number | Date, withObservable: Observable<any>, scheduler?: Scheduler) => Observable<T>;
  toArray: () => Observable<T[]>;
  toPromise: (PromiseCtor: PromiseConstructor) => Promise<T>;
  window: <T>(closingNotifier: Observable<any>) => Observable<Observable<T>>;
  windowCount: <T>(windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
  windowTime: <T>(windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
  windowToggle: <T, O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>;
  windowWhen: <T>(closingSelector: () => Observable<any>) => Observable<Observable<T>>;
  withLatestFrom: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zip: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
}