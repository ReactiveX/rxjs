import Subject from './Subject';
import Observer from './Observer';
import Operator from './Operator';
import Scheduler from './Scheduler';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import ConnectableObservable from './observables/ConnectableObservable';
import GroupSubject from './subjects/GroupSubject';


import $$observable from './util/Symbol_observable';


/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *  
 * @class Observable<T>
 */
export default class Observable<T>  {

  source: Observable<any>;
  operator: Operator<any, T>;
  _isScalar: boolean = false;
  
  /**
   * @constructor
   * @param {Function} subscribe the function that is
   * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
   * of a succesful completion.
   */
  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription<T>|Function|void) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  
  // HACK: Since TypeScript inherits static properties too, we have to 
  // fight against TypeScript here so Subject can have a different static create signature.
  
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
   * @param {Operator} the operator defining the operation to take on the observable
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
   * @returns {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next:(value:T) => void) {
    return new Promise((resolve, reject) => {
      this.subscribe(next, reject, resolve);
    });
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> | Function | void {
    return this.source._subscribe(this.operator.call(subscriber));
  }

  // TODO: convert this to an `abstract` class in TypeScript 1.6.

  static defer: <T>(observableFactory: () => Observable<T>) => Observable<T>;
  static from: <T>(iterable: any, scheduler?: Scheduler) => Observable<T>;
  static fromArray: <T>(array: T[], scheduler?: Scheduler) => Observable<T>;
  static fromEvent: <T>(element: any, eventName: string, selector: (...args:Array<any>) => T) => Observable<T>;
  static fromEventPattern: <T>(addHandler: (handler:Function)=>void, removeHandler: (handler:Function) => void, selector?: (...args:Array<any>) => T) => Observable<T>;
  static throw: <T>(error: T) => Observable<T>;
  static empty: <T>() => Observable<T>;
  static never: <T>() => Observable<T>;
  static of: <T>(...values: (T | Scheduler)[]) => Observable<T>;
  static range: <T>(start: number, end: number, scheduler?: Scheduler) => Observable<number>;
  static fromPromise: <T>(promise: Promise<T>) => Observable<T>;
  static timer: (delay: number) => Observable<number>;
  static interval: (interval: number) => Observable<number>;
  static forkJoin: (...observables: Observable<any>[]) => Observable<any[]>;
  
  static concat: (...observables: any[]) => Observable<any>;
  concat: (...observables: any[]) => Observable<any>;
  concatAll: () => Observable<any>;
  concatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
                 projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  concatMapTo: <R>(observable: Observable<any>,
                   projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;

  static merge: (...observables:any[]) => Observable<any>;
  merge: (...observables:any[]) => Observable<any>;
  mergeAll: (concurrent?: any) => Observable<any>;
  flatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
               projectResult?: (x: T, y: any, ix: number, iy: number) => R,
               concurrent?: number) => Observable<R>;
  flatMapTo: <R>(observable: Observable<any>,
                 projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                 concurrent?: number) => Observable<R>;

  expand: (project: (x: T, ix: number) => Observable<any>) => Observable<any>;
  delay: <T>(delay: number, scheduler?: Scheduler) => Observable<T>;

  switchAll: <R>() => Observable<R>;
  switchLatest: <R>(project: ((x: T, ix: number) => Observable<any>),
                    projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  switchLatestTo: <R>(observable: Observable<any>,
                      projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;

  static combineLatest: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  combineLatest: <R>(...observables: (Observable<any> | ((...values: Array<any>) => R)) []) => Observable<R>;
  combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
  withLatestFrom: <R>(...observables: (Observable<any> | ((...values: Array<any>) => R)) []) => Observable<R>;
  static zip: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  zip: <R>(...observables: (Observable<any> | ((...values: Array<any>) => R)) []) => Observable<R>;
  zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;

  do: <T>(next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
  map: <T, R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  mapTo: <R>(value: R) => Observable<R>;
  toArray: () => Observable<T[]>;
  count: () => Observable<number>;
  scan: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  reduce: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  startWith: <T>(x: T) => Observable<T>;
  debounce: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
  
  filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  distinctUntilChanged: (compare?: (x: T, y: T) => boolean, thisArg?: any) => Observable<T>;
  distinctUntilKeyChanged: (key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) => Observable<T>;
  skip: (count: number) => Observable<T>;
  skipUntil: (notifier: Observable<any>) => Observable<T>;
  take: (count: number) => Observable<T>;
  takeUntil: (observable: Observable<any>) => Observable<T>;
  partition: (predicate: (x: T) => boolean) => Observable<T>[];
  toPromise: (PromiseCtor: PromiseConstructor) => Promise<T>;
  defaultIfEmpty: <T, R>(defaultValue: R) => Observable<T>|Observable<R>;
  // HACK: this should be Observable<Notification<T>>, but the build process didn't like it. :(
  //   this will be fixed when we can move everything to the TypeScript compiler I suspect.
  materialize: () => Observable<any>;
  throttle: (delay: number, scheduler?: Scheduler) => Observable<T>;

  observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;

  publish: () => ConnectableObservable<T>;
  publishBehavior: (value: any) => ConnectableObservable<T>;
  publishReplay: (bufferSize: number, windowTime: number, scheduler?: Scheduler) => ConnectableObservable<T>;
  multicast: (subjectFactory: () => Subject<T>) => ConnectableObservable<T>;

  catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
  retry: <T>(count: number) => Observable<T>;
  retryWhen: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
  repeat: <T>(count: number) => Observable<T>;
  
  groupBy: <T, R>(keySelector: (value:T) => string, durationSelector?: (group:GroupSubject<R>) => Observable<any>, elementSelector?: (value:T) => R) => Observable<R>;
  window: <T>(closingNotifier: Observable<any>) => Observable<Observable<T>>;
  windowWhen: <T>(closingSelector: () => Observable<any>) => Observable<Observable<T>>;
  windowToggle: <T, O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>
  windowTime: <T>(windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
  windowCount: <T>(windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
  
  buffer: <T>(closingNotifier: Observable<any>) => Observable<T[]>;
  bufferWhen: <T>(closingSelector: () => Observable<any>) => Observable<T[]>;
  bufferToggle: <T, O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>
  bufferTime: <T>(bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
  bufferCount: <T>(bufferSize: number, startBufferEvery: number) => Observable<T[]>;
  
  sample: <T>(notifier: Observable<any>) => Observable<T>;
  sampleTime: <T>(delay: number, scheduler?: Scheduler) => Observable<T>;
  
  finally: (ensure: () => void, thisArg?: any) => Observable<T>;
  timeout: <T>(due: number|Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
  timeoutWith: <T>(due: number|Date, withObservable: Observable<any>, scheduler?: Scheduler) => Observable<T>;
}