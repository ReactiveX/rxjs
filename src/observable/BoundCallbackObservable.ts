import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { AsyncSubject } from '../AsyncSubject';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class BoundCallbackObservable<T> extends Observable<T> {
  subject: AsyncSubject<T>;

  /* tslint:disable:max-line-length */
  static create<R>(callbackFunc: (callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<R>(callbackFunc: (callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
  /* tslint:enable:max-line-length */

  /**
   * Converts a callback API to a function that returns an Observable.
   *
   * <span class="informal">Give it a function `f` of type `f(x, callback)` and
   * it will return a function `g` that when called as `g(x)` will output an
   * Observable.</span>
   *
   * `bindCallback` is not an operator because its input and output are not
   * Observables. The input is a function `func` with some parameters, but the
   * last parameter must be a callback function that `func` calls when it is
   * done. The output of `bindCallback` is a function that takes the same
   * parameters as `func`, except the last one (the callback). When the output
   * function is called with arguments, it will return an Observable where the
   * results will be delivered to.
   *
   * @example <caption>Convert jQuery's getJSON to an Observable API</caption>
   * // Suppose we have jQuery.getJSON('/my/url', callback)
   * var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
   * var result = getJSONAsObservable('/my/url');
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @see {@link bindNodeCallback}
   * @see {@link from}
   * @see {@link fromPromise}
   *
   * @param {function} func Function with a callback as the last parameter.
   * @param {function} [selector] A function which takes the arguments from the
   * callback and maps those a value to emit on the output Observable.
   * @param {Scheduler} [scheduler] The scheduler on which to schedule the
   * callbacks.
   * @return {function(...params: *): Observable} A function which returns the
   * Observable that delivers the same values the callback would deliver.
   * @static true
   * @name bindCallback
   * @owner Observable
   */
  static create<T>(func: Function,
                   selector: Function | void = undefined,
                   scheduler?: Scheduler): (...args: any[]) => Observable<T> {
    return (...args: any[]): Observable<T> => {
      return new BoundCallbackObservable<T>(func, <any>selector, args, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              private scheduler: Scheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T | T[]>): Subscription {
    const callbackFunc = this.callbackFunc;
    const args = this.args;
    const scheduler = this.scheduler;
    let subject = this.subject;

    if (!scheduler) {
      if (!subject) {
        subject = this.subject = new AsyncSubject<T>();
        const handler = function handlerFn(this: any, ...innerArgs: any[]) {
          const source = (<any>handlerFn).source;
          const { selector, subject } = source;
          if (selector) {
            const result = tryCatch(selector).apply(this, innerArgs);
            if (result === errorObject) {
              subject.error(errorObject.e);
          } else {
              subject.next(result);
              subject.complete();
            }
          } else {
            subject.next(innerArgs.length === 1 ? innerArgs[0] : innerArgs);
            subject.complete();
          }
        };
        // use named function instance to avoid closure.
        (<any>handler).source = this;

        const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
        if (result === errorObject) {
          subject.error(errorObject.e);
        }
      }
      return subject.subscribe(subscriber);
    } else {
      return scheduler.schedule(BoundCallbackObservable.dispatch, 0, { source: this, subscriber });
    }
  }

  static dispatch<T>(state: { source: BoundCallbackObservable<T>, subscriber: Subscriber<T> }) {
    const self = (<Subscription><any>this);
    const { source, subscriber } = state;
    const { callbackFunc, args, scheduler } = source;
    let subject = source.subject;

    if (!subject) {
      subject = source.subject = new AsyncSubject<T>();

      const handler = function handlerFn(this: any, ...innerArgs: any[]) {
        const source = (<any>handlerFn).source;
        const { selector, subject } = source;
        if (selector) {
          const result = tryCatch(selector).apply(this, innerArgs);
          if (result === errorObject) {
            self.add(scheduler.schedule(dispatchError, 0, { err: errorObject.e, subject }));
          } else {
            self.add(scheduler.schedule(dispatchNext, 0, { value: result, subject }));
          }
        } else {
          const value = innerArgs.length === 1 ? innerArgs[0] : innerArgs;
          self.add(scheduler.schedule(dispatchNext, 0, { value, subject }));
        }
      };
      // use named function to pass values in without closure
      (<any>handler).source = source;

      const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
      if (result === errorObject) {
        subject.error(errorObject.e);
      }
    }

    self.add(subject.subscribe(subscriber));
  }
}

interface DispatchNextArg<T> {
  subject: AsyncSubject<T>;
  value: T;
}
function dispatchNext<T>(arg: DispatchNextArg<T>) {
  const { value, subject } = arg;
  subject.next(value);
  subject.complete();
}

interface DispatchErrorArg<T> {
  subject: AsyncSubject<T>;
  err: any;
}
function dispatchError<T>(arg: DispatchErrorArg<T>) {
  const { err, subject } = arg;
  subject.error(err);
}
