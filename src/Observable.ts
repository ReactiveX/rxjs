/// <reference path="../typings/operators.d.ts" />

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

import {combineLatest as combineLatestStatic} from "./operators/combineLatest-static";
import {concat as concatStatic} from "./operators/concat-static";
import {merge as mergeStatic} from "./operators/merge-static";
import {zip as zipStatic} from "./operators/merge-static";
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
  buffer: operator_proto_buffer;
  bufferCount: operator_proto_bufferCount;
  bufferTime: operator_proto_bufferTime;
  bufferToggle: operator_proto_bufferToggle;
  bufferWhen: operator_proto_bufferWhen;
  catch: operator_proto_catch;
  combineAll: operator_proto_combineAll;
  combineLatest: operator_proto_combineLatest;
  concat: operator_proto_concat;
  concatAll: operator_proto_concatAll;
  concatMap: operator_proto_concatMap;
  concatMapTo: operator_proto_concatMapTo;
  count: operator_proto_count;
  dematerialize: operator_proto_dematerialize;
  debounce: operator_proto_debounce;
  debounceTime: operator_proto_debounceTime;
  defaultIfEmpty: operator_proto_defaultIfEmpty;
  delay: operator_proto_delay;
  distinctUntilChanged: operator_proto_distinctUntilChanged;
  do: operator_proto_do;
  expand: operator_proto_expand;
  filter: operator_proto_filter;
  finally: operator_proto_finally;
  first: operator_proto_first;
  flatMap: operator_proto_mergeMap;
  flatMapTo: operator_proto_mergeMapTo;
  groupBy: operator_proto_groupBy;
  ignoreElements: operator_proto_ignoreElements;
  last: operator_proto_last;
  every: operator_proto_every;
  map: operator_proto_map;
  mapTo: operator_proto_mapTo;
  materialize: operator_proto_materialize;
  merge: operator_proto_merge;
  mergeAll: operator_proto_mergeAll;
  mergeMap: operator_proto_mergeMap;
  mergeMapTo: operator_proto_mergeMapTo;
  multicast: operator_proto_multicast;
  observeOn: operator_proto_observeOn;
  partition: operator_proto_partition;
  publish: operator_proto_publish;
  publishBehavior: operator_proto_publishBehavior;
  publishReplay: operator_proto_publishReplay;
  reduce: operator_proto_reduce;
  repeat: operator_proto_repeat;
  retry: operator_proto_retry;
  retryWhen: operator_proto_retryWhen;
  sample: operator_proto_sample;
  sampleTime: operator_proto_sampleTime;
  scan: operator_proto_scan;
  share: operator_proto_share;
  single: operator_proto_single;
  skip: operator_proto_skip;
  skipUntil: operator_proto_skipUntil;
  startWith: operator_proto_startWith;
  subscribeOn: operator_proto_subscribeOn;
  switch: operator_proto_switch;
  switchMap: operator_proto_switchMap;
  switchMapTo: operator_proto_switchMapTo;
  take: operator_proto_take;
  takeUntil: operator_proto_takeUntil;
  throttle: operator_proto_throttle;
  throttleTime: operator_proto_throttleTime;
  timeout: operator_proto_timeout;
  timeoutWith: operator_proto_timeoutWith;
  toArray: operator_proto_toArray;
  toPromise: operator_proto_toPromise;
  window: operator_proto_window;
  windowCount: operator_proto_windowCount;
  windowTime: operator_proto_windowTime;
  windowToggle: operator_proto_windowToggle;
  windowWhen: operator_proto_windowWhen;
  withLatestFrom: operator_proto_withLatestFrom;
  zip: operator_proto_zip;
  zipAll: operator_proto_zipAll;
}

