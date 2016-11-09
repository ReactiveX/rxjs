import { PartialObserver } from './Observer';
import { Operator } from './Operator';
import { Subscriber } from './Subscriber';
import { Subscription, AnonymousSubscription, TeardownLogic } from './Subscription';
import { root } from './util/root';
import { toSubscriber } from './util/toSubscriber';
import { IfObservable } from './observable/IfObservable';
import { ErrorObservable } from './observable/ErrorObservable';
import { $$observable } from './symbol/observable';

export interface Subscribable<T> {
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): AnonymousSubscription;
}

export type SubscribableOrPromise<T> = Subscribable<T> | PromiseLike<T>;
export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T>;

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements Subscribable<T> {

  public _isScalar: boolean = false;

  protected source: Observable<any>;
  protected operator: Operator<any, T>;

  /**
   * @constructor
   * @param {Function} subscribe the function that is  called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(subscribe?: <R>(this: Observable<T>, subscriber: Subscriber<R>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * Creates a new cold Observable by calling the Observable constructor
   * @static true
   * @owner Observable
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @return {Observable} a new cold observable
   */
  static create: Function = <T>(subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic) => {
    return new Observable<T>(subscribe);
  };

  /**
   * Creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @return {Observable} a new observable with the Operator applied
   */
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  /**
   * Registers handlers for handling emitted values, error and completions from the observable, and
   *  executes the observable's subscriber function, which will take action to set up the underlying data stream
   * @method subscribe
   * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
   *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
   * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
   *  the error will be thrown as unhandled
   * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
   * @return {ISubscription} a subscription reference to the registered handlers
   */
  subscribe(): Subscription;
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {

    const { operator } = this;
    const sink = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      operator.call(sink, this);
    } else {
      sink.add(this._subscribe(sink));
    }

    if (sink.syncErrorThrowable) {
      sink.syncErrorThrowable = false;
      if (sink.syncErrorThrown) {
        throw sink.syncErrorValue;
      }
    }

    return sink;
  }

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
   * @return {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next: (value: T) => void, PromiseCtor?: typeof Promise): Promise<void> {
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
      const subscription = this.subscribe((value) => {
        if (subscription) {
          // if there is a subscription, then we can surmise
          // the next handling is asynchronous. Any errors thrown
          // need to be rejected explicitly and unsubscribe must be
          // called manually
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscription.unsubscribe();
          }
        } else {
          // if there is NO subscription, then we're getting a nexted
          // value synchronously during subscription. We can just call it.
          // If it errors, Observable's `subscribe` will ensure the
          // unsubscription logic is called, then synchronously rethrow the error.
          // After that, Promise will trap the error and send it
          // down the rejection path.
          next(value);
        }
      }, reject, resolve);
    });
  }

  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    return this.source.subscribe(subscriber);
  }

  // `if` and `throw` are special snow flakes, the compiler sees them as reserved words
  static if: typeof IfObservable.create;
  static throw: typeof ErrorObservable.create;

  /**
   * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   * @method Symbol.observable
   * @return {Observable} this instance of the observable
   */
  [$$observable]() {
    return this;
  }
}
