import {Observer} from './Observer';
import {Operator} from './Operator';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {root} from './util/root';
import {CoreOperators} from './CoreOperators';
import {SymbolShim} from './util/SymbolShim';
import {toSubscriber} from './util/toSubscriber';
import {tryCatch} from './util/tryCatch';
import {errorObject} from './util/errorObject';

import {combineLatestStatic} from './operator/combineLatest';
import {concatStatic} from './operator/concat';
import {mergeStatic} from './operator/merge';
import {zipStatic} from './operator/zip';
import {BoundCallbackObservable} from './observable/BoundCallbackObservable';
import {BoundNodeCallbackObservable} from './observable/BoundNodeCallbackObservable';
import {DeferObservable} from './observable/DeferObservable';
import {EmptyObservable} from './observable/EmptyObservable';
import {ForkJoinObservable} from './observable/ForkJoinObservable';
import {FromObservable} from './observable/FromObservable';
import {ArrayObservable} from './observable/ArrayObservable';
import {FromEventObservable} from './observable/FromEventObservable';
import {FromEventPatternObservable} from './observable/FromEventPatternObservable';
import {PromiseObservable} from './observable/PromiseObservable';
import {IntervalObservable} from './observable/IntervalObservable';
import {TimerObservable} from './observable/TimerObservable';
import {raceStatic} from './operator/race';
import {RangeObservable} from './observable/RangeObservable';
import {NeverObservable} from './observable/NeverObservable';
import {ErrorObservable} from './observable/ErrorObservable';
import {AjaxCreationMethod} from './observable/dom/AjaxObservable';
import {WebSocketSubject} from './observable/dom/WebSocketSubject';

export type ObservableOrPromise<T> = Observable<T> | Promise<T>;
export type ArrayOrIterator<T> = Iterator<T> | ArrayLike<T>;
export type ObservableInput<T> = ObservableOrPromise<T> | ArrayOrIterator<T>;

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
      subscriber.add(this._subscribe(operator.call(subscriber)));
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
  forEach(next: (value: T) => void, thisArg: any, PromiseCtor?: typeof Promise): Promise<void> {
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

    const source = this;

    return new PromiseCtor<void>((resolve, reject) => {
      source.subscribe((value: T) => {
        const result: any = tryCatch(next).call(thisArg, value);
        if (result === errorObject) {
          reject(errorObject.e);
        }
      }, reject, resolve);
    });
  }

  protected _subscribe(subscriber: Subscriber<any>): Subscription | Function | void {
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
  static never: typeof NeverObservable.create;
  static of: typeof ArrayObservable.of;
  static race: typeof raceStatic;
  static range: typeof RangeObservable.create;
  static throw: typeof ErrorObservable.create;
  static timer: typeof TimerObservable.create;
  static webSocket: typeof WebSocketSubject.create;
  static zip: typeof zipStatic;

  /**
   * @method Symbol.observable
   * @returns {Observable} this instance of the observable
   * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   */
  [SymbolShim.observable]() {
    return this;
  }
}
