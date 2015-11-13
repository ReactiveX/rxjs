import {Observer} from './Observer';
import {Operator} from './Operator';
import {Scheduler} from './Scheduler';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {root} from './util/root';
import {CoreOperators} from './CoreOperators';
import {$$observable} from './util/Symbol_observable';
import {GroupedObservable} from './operators/groupBy-support';
import {ConnectableObservable} from './observables/ConnectableObservable';
import {Subject} from './Subject';
import {Notification} from './Notification';

export type ObservableOrPromise<T> = Observable<T> | PromiseLike<T>;
export type ArrayOrIterable<T> = IterableShim<T> | ArrayLike<T> | Array<T>;
export type ObservableOrIterable<T> = ObservableOrPromise<T> | ArrayOrIterable<T>;
import * as operators from "./operator-typings";

import {combineLatest as combineLatestStatic} from "./operators/combineLatest-static";
import {concat as concatStatic} from "./operators/concat-static";
import {merge as mergeStatic} from "./operators/merge-static";
import {zip as zipStatic} from "./operators/zip-static";
import {DeferObservable} from './observables/DeferObservable';
import {EmptyObservable} from './observables/EmptyObservable';
import {ForkJoinObservable} from './observables/ForkJoinObservable';
import {FromObservable} from './observables/FromObservable';
import {ArrayObservable} from './observables/ArrayObservable';
import {FromEventObservable} from './observables/FromEventObservable';
import {FromEventPatternObservable} from './observables/FromEventPatternObservable';
import {PromiseObservable} from './observables/PromiseObservable';
import {IntervalObservable} from './observables/IntervalObservable';
import {InfiniteObservable} from './observables/InfiniteObservable';
import {TimerObservable} from './observables/TimerObservable';
import {RangeObservable} from './observables/RangeObservable';
import {ErrorObservable} from './observables/ErrorObservable';

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements CoreOperators<T>  {
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
    const observable = new Observable<T>();
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

    if (observerOrNext && typeof observerOrNext === 'object') {
      if (observerOrNext instanceof Subscriber) {
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
  forEach(next: (value: T) => void, PromiseCtor?: PromiseConstructor): Promise<void> {
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

    return new PromiseCtor<void>((resolve, reject) => {
      this.subscribe(next, reject, resolve);
    });
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> | Function | void {
    return this.source._subscribe(this.operator.call(subscriber));
  }

  // static method stubs
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
  static range: typeof RangeObservable.create;
  static throw: typeof ErrorObservable.create;
  static timer: typeof TimerObservable.create;
  static zip: typeof zipStatic;

  // core operators
  buffer: operators.operator_proto_buffer<T>;
  bufferCount: operators.operator_proto_bufferCount<T>;
  bufferTime: operators.operator_proto_bufferTime<T>;
  bufferToggle: operators.operator_proto_bufferToggle<T>;
  bufferWhen: operators.operator_proto_bufferWhen<T>;
  catch: operators.operator_proto_catch<T>;
  combineAll: operators.operator_proto_combineAll<T>;
  combineLatest: operators.operator_proto_combineLatest<T>;
  concat: operators.operator_proto_concat<T>;
  concatAll: operators.operator_proto_concatAll<T>;
  concatMap: operators.operator_proto_concatMap<T>;
  concatMapTo: operators.operator_proto_concatMapTo<T>;
  count: operators.operator_proto_count<T>;
  dematerialize: operators.operator_proto_dematerialize<T>;
  debounce: operators.operator_proto_debounce<T>;
  debounceTime: operators.operator_proto_debounceTime<T>;
  defaultIfEmpty: operators.operator_proto_defaultIfEmpty<T>;
  delay: operators.operator_proto_delay<T>;
  distinctUntilChanged: operators.operator_proto_distinctUntilChanged<T>;
  do: operators.operator_proto_do<T>;
  expand: operators.operator_proto_expand<T>;
  filter: operators.operator_proto_filter<T>;
  finally: operators.operator_proto_finally<T>;
  first: operators.operator_proto_first<T>;
  flatMap: operators.operator_proto_mergeMap<T>;
  flatMapTo: operators.operator_proto_mergeMapTo<T>;
  groupBy: operators.operator_proto_groupBy<T>;
  ignoreElements: operators.operator_proto_ignoreElements<T>;
  last: operators.operator_proto_last<T>;
  every: operators.operator_proto_every<T>;
  map: operators.operator_proto_map<T>;
  mapTo: operators.operator_proto_mapTo<T>;
  materialize: operators.operator_proto_materialize<T>;
  merge: operators.operator_proto_merge<T>;
  mergeAll: operators.operator_proto_mergeAll<T>;
  mergeMap: operators.operator_proto_mergeMap<T>;
  mergeMapTo: operators.operator_proto_mergeMapTo<T>;
  multicast: operators.operator_proto_multicast<T>;
  observeOn: operators.operator_proto_observeOn<T>;
  partition: operators.operator_proto_partition<T>;
  publish: operators.operator_proto_publish<T>;
  publishBehavior: operators.operator_proto_publishBehavior<T>;
  publishReplay: operators.operator_proto_publishReplay<T>;
  reduce: operators.operator_proto_reduce<T>;
  repeat: operators.operator_proto_repeat<T>;
  retry: operators.operator_proto_retry<T>;
  retryWhen: operators.operator_proto_retryWhen<T>;
  sample: operators.operator_proto_sample<T>;
  sampleTime: operators.operator_proto_sampleTime<T>;
  scan: operators.operator_proto_scan<T>;
  share: operators.operator_proto_share<T>;
  single: operators.operator_proto_single<T>;
  skip: operators.operator_proto_skip<T>;
  skipUntil: operators.operator_proto_skipUntil<T>;
  startWith: operators.operator_proto_startWith<T>;
  subscribeOn: operators.operator_proto_subscribeOn<T>;
  switch: operators.operator_proto_switch<T>;
  switchMap: operators.operator_proto_switchMap<T>;
  switchMapTo: operators.operator_proto_switchMapTo<T>;
  take: operators.operator_proto_take<T>;
  takeUntil: operators.operator_proto_takeUntil<T>;
  throttle: operators.operator_proto_throttle<T>;
  throttleTime: operators.operator_proto_throttleTime<T>;
  timeout: operators.operator_proto_timeout<T>;
  timeoutWith: operators.operator_proto_timeoutWith<T>;
  toArray: operators.operator_proto_toArray<T>;
  toPromise: operators.operator_proto_toPromise<T>;
  window: operators.operator_proto_window<T>;
  windowCount: operators.operator_proto_windowCount<T>;
  windowTime: operators.operator_proto_windowTime<T>;
  windowToggle: operators.operator_proto_windowToggle<T>;
  windowWhen: operators.operator_proto_windowWhen<T>;
  withLatestFrom: operators.operator_proto_withLatestFrom<T>;
  zip: operators.operator_proto_zip<T>;
  zipAll: operators.operator_proto_zipAll<T>;
}
