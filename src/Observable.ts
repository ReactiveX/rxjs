import Observer from './Observer';
import Operator from './Operator';
import Scheduler from './Scheduler';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import { root } from './util/root';
import { CoreOperators } from './CoreOperators';
import $$observable from './util/Symbol_observable';


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
  static combineLatest: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  static concat: (...observables: any[]) => Observable<any>;
  static defer: <T>(observableFactory: () => Observable<T>) => Observable<T>;
  static empty: <T>() => Observable<T>;
  static forkJoin: (...observables: Observable<any>[]) => Observable<any[]>;
  static from: <T>(iterable: any, scheduler?: Scheduler) => Observable<T>;
  static fromArray: <T>(array: T[], scheduler?: Scheduler) => Observable<T>;
  static fromEvent: <T>(element: any, eventName: string, selector: (...args:Array<any>) => T) => Observable<T>;
  static fromEventPattern: <T>(addHandler: (handler:Function)=>void, removeHandler: (handler:Function) => void, selector?: (...args:Array<any>) => T) => Observable<T>;
  static fromPromise: <T>(promise: Promise<T>, scheduler?: Scheduler) => Observable<T>;
  static interval: (interval: number, scheduler?: Scheduler) => Observable<number>;
  static merge: (...observables:any[]) => Observable<any>;
  static never: <T>() => Observable<T>;
  static of: <T>(...values: (T | Scheduler)[]) => Observable<T>;
  static range: <T>(start: number, end: number, scheduler?: Scheduler) => Observable<number>;
  static throw: <T>(error: T) => Observable<T>;
  static timer: (dueTime: number, period?: number | Scheduler, scheduler?: Scheduler) => Observable<number>;
  static zip: <T>(...observables: (Observable<any> | ((...values: Array<any>) => T)) []) => Observable<T>;
  ignoreElements: () => Observable<T>;
}