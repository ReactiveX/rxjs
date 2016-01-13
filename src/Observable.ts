import {Observer} from './Observer';
import {Operator} from './Operator';
import {Scheduler} from './Scheduler';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {root} from './util/root';
import {CoreOperators} from './CoreOperators';
import {SymbolShim} from './util/SymbolShim';
import {GroupedObservable} from './operator/groupBy-support';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Subject} from './Subject';
import {Notification} from './Notification';
import {toSubscriber} from './util/toSubscriber';

import {combineLatest as combineLatestStatic} from './operator/combineLatest-static';
import {concat as concatStatic} from './operator/concat-static';
import {merge as mergeStatic} from './operator/merge-static';
import {zip as zipStatic} from './operator/zip-static';
import {BoundCallbackObservable} from './observable/bindCallback';
import {BoundNodeCallbackObservable} from './observable/bindNodeCallback';
import {DeferObservable} from './observable/defer';
import {EmptyObservable} from './observable/empty';
import {ForkJoinObservable} from './observable/forkJoin';
import {FromObservable} from './observable/from';
import {ArrayObservable} from './observable/fromArray';
import {FromEventObservable} from './observable/fromEvent';
import {FromEventPatternObservable} from './observable/fromEventPattern';
import {PromiseObservable} from './observable/fromPromise';
import {IntervalObservable} from './observable/interval';
import {TimerObservable} from './observable/timer';
import {race as raceStatic} from './operator/race-static';
import {RangeObservable} from './observable/range';
import {InfiniteObservable} from './observable/never';
import {ErrorObservable} from './observable/throw';
import {AjaxCreationMethod} from './observable/dom/ajax';
import {WebSocketSubject} from './observable/dom/webSocket';

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements CoreOperators<T>  {

  public _isScalar: boolean = false;

  protected source: Observable<any>;
  protected operator: Operator<any, T>;

  /**
   * @constructor
   * @param {Function} subscribe the function that is
   * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
   * of a successful completion.
   */
  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) {
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
  static create: Function = <T>(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) => {
    return new Observable<T>(subscribe);
  };

  /**
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @returns {Observable} a new observable with the Operator applied
   * @description creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   */
  lift<T, R>(operator: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
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
            error?: (error: any) => void,
            complete?: () => void): Subscription {

    const { operator } = this;
    const subscriber = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      subscriber.add(this._subscribe(this.operator.call(subscriber)));
    } else {
      subscriber.add(this._subscribe(subscriber));
    }

    return subscriber;
  }

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {any} [thisArg] a `this` context for the `next` handler function
   * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
   * @returns {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next: (value: T) => void, thisArg: any, PromiseCtor?: PromiseConstructor): Promise<void> {
    if (!PromiseCtor) {
      if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
        PromiseCtor = root.Rx.config.Promise;
      } else if (root.Promise) {
        PromiseCtor = root.Promise;
      }
    }

    if (!PromiseCtor) {
      throw new Error('no Promise impl found');
    }

    let nextHandler: any;

    if (thisArg) {
      nextHandler = function nextHandlerFn(value: any): void {
        const { thisArg, next } = <any>nextHandlerFn;
        return next.call(thisArg, value);
      };
      nextHandler.thisArg = thisArg;
      nextHandler.next = next;
    } else {
      nextHandler = next;
    }

    const promiseCallback = function promiseCallbackFn(resolve: Function, reject: Function) {
      const { source, nextHandler } = <any>promiseCallbackFn;
      source.subscribe(nextHandler, reject, resolve);
    };
    (<any>promiseCallback).source = this;
    (<any>promiseCallback).nextHandler = nextHandler;

    return new PromiseCtor<void>(promiseCallback);
  }

  _subscribe(subscriber: Subscriber<any>): Subscription | Function | void {
    return this.source.subscribe(subscriber);
  }

  // static method stubs
  static ajax: AjaxCreationMethod;
  static bindCallback: typeof BoundCallbackObservable.create;
  static bindNodeCallback: typeof BoundNodeCallbackObservable.create;
  static combineLatest: typeof combineLatestStatic;
  static concat: typeof concatStatic;
  static defer: typeof DeferObservable.create;
  static empty: typeof EmptyObservable.create;
  static forkJoin: typeof ForkJoinObservable.create;
  static from: typeof FromObservable.create;
  static fromArray: typeof ArrayObservable.create;
  static fromEvent: typeof FromEventObservable.create;
  static fromEventPattern: typeof FromEventPatternObservable.create;
  static fromPromise: typeof PromiseObservable.create;
  static interval: typeof IntervalObservable.create;
  static merge: typeof mergeStatic;
  static never: typeof InfiniteObservable.create;
  static of: typeof ArrayObservable.of;
  static race: typeof raceStatic;
  static range: typeof RangeObservable.create;
  static throw: typeof ErrorObservable.create;
  static timer: typeof TimerObservable.create;
  static webSocket: typeof WebSocketSubject.create;
  static zip: typeof zipStatic;

  // core operators
  buffer: (closingNotifier: Observable<any>) => Observable<T[]>;
  bufferCount: (bufferSize: number, startBufferEvery: number) => Observable<T[]>;
  bufferTime: (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
  bufferToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>;
  bufferWhen: (closingSelector: () => Observable<any>) => Observable<T[]>;
  catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
  combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
  combineLatest: <R>(...observables: Array<Observable<any> |
                                     Array<Observable<any>> |
                                     ((...values: Array<any>) => R)>) => Observable<R>;
  concat: <R>(...observables: (Observable<any> | Scheduler)[]) => Observable<R>;
  concatAll: () => Observable<any>;
  concatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  concatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  count: (predicate?: (value: T, index: number, source: Observable<T>) => boolean) => Observable<number>;
  dematerialize: () => Observable<any>;
  debounce: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  debounceTime: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
  defaultIfEmpty: <R>(defaultValue?: T | R) => Observable<T> | Observable<R>;
  delay: (delay: number, scheduler?: Scheduler) => Observable<T>;
  distinctUntilChanged: (compare?: (x: T, y: T) => boolean) => Observable<T>;
  do: (next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
  expand: <R>(project: (x: T, ix: number) => Observable<R>, concurrent: number, scheduler: Scheduler) => Observable<R>;
  filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  finally: (finallySelector: () => void) => Observable<T>;
  first: <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
             resultSelector?: (value: T, index: number) => R, defaultValue?: any) => Observable<T> | Observable<R>;
  flatMap: <R>(project: ((x: T, ix: number) => Observable<any>),
               projectResult?: (x: T, y: any, ix: number, iy: number) => R,
               concurrent?: number) => Observable<R>;
  flatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  groupBy: <K, R>(keySelector: (value: T) => string,
               elementSelector?: (value: T) => R,
               durationSelector?: (group: GroupedObservable<K, R>) => Observable<any>) => Observable<GroupedObservable<K, R>>;
  ignoreElements: () => Observable<T>;
  last: <R>(predicate?: (value: T, index: number) => boolean,
            resultSelector?: (value: T, index: number) => R,
            defaultValue?: any) => Observable<T> | Observable<R>;
  let: <T, R>(func: (selector: Observable<T>) => Observable<R>) => Observable<R>;
  letBind: <T, R>(func: (selector: Observable<T>) => Observable<R>) => Observable<R>;
  every: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  map: <R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  mapTo: <R>(value: R) => Observable<R>;
  materialize: () => Observable<Notification<T>>;
  merge: (...observables: any[]) => Observable<any>;
  mergeAll: (concurrent?: any) => Observable<any>;
  mergeMap: <R>(project: ((x: T, ix: number) => Observable<any>),
                projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                concurrent?: number) => Observable<R>;
  mergeMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  multicast: (subjectOrSubjectFactory: Subject<T>|(() => Subject<T>)) => ConnectableObservable<T>;
  observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  partition: (predicate: (x: T) => boolean) => Observable<T>[];
  pluck: (...properties: string[]) => Observable<any>;
  publish: () => ConnectableObservable<T>;
  publishBehavior: (value: any) => ConnectableObservable<T>;
  publishReplay: (bufferSize?: number, windowTime?: number, scheduler?: Scheduler) => ConnectableObservable<T>;
  publishLast: () => ConnectableObservable<T>;
  race: (...observables: Array<Observable<any>>) => Observable<any>;
  reduce: <R>(project: (acc: R, x: T) => R, seed?: R) => Observable<R>;
  repeat: (count?: number) => Observable<T>;
  retry: (count?: number) => Observable<T>;
  retryWhen: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
  sample: (notifier: Observable<any>) => Observable<T>;
  sampleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
  scan: <R>(accumulator: (acc: R, x: T) => R, seed?: T | R) => Observable<R>;
  share: () => Observable<T>;
  single: (predicate?: (value: T, index: number) => boolean) => Observable<T>;
  skip: (count: number) => Observable<T>;
  skipUntil: (notifier: Observable<any>) => Observable<T>;
  skipWhile: (predicate: (x: T, index: number) => boolean) => Observable<T>;
  startWith: (x: T) => Observable<T>;
  subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
  switch: <R>() => Observable<R>;
  switchMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  switchMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  take: (count: number) => Observable<T>;
  takeUntil: (notifier: Observable<any>) => Observable<T>;
  takeWhile: (predicate: (value: T, index: number) => boolean) => Observable<T>;
  throttle: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  throttleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
  timeout: (due: number | Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
  timeoutWith: <R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler) => Observable<T> | Observable<R>;
  toArray: () => Observable<T[]>;
  toPromise: (PromiseCtor?: PromiseConstructor) => Promise<T>;
  window: (closingNotifier: Observable<any>) => Observable<Observable<T>>;
  windowCount: (windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
  windowTime: (windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
  windowToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>;
  windowWhen: (closingSelector: () => Observable<any>) => Observable<Observable<T>>;
  withLatestFrom: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zip: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;

  /**
   * @method Symbol.observable
   * @returns {Observable} this instance of the observable
   * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   */
  [SymbolShim.observable]() {
    return this;
  }
}
