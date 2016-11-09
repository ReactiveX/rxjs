import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { AsyncSubject } from '../AsyncSubject';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class BoundNodeCallbackObservable<T> extends Observable<T> {
  subject: AsyncSubject<T>;

  /* tslint:disable:max-line-length */
  static create<R>(callbackFunc: (callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: Scheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: Scheduler): (...args: any[]) => Observable<T>;
  /* tslint:enable:max-line-length */

  /**
   * Converts a Node.js-style callback API to a function that returns an
   * Observable.
   *
   * <span class="informal">It's just like {@link bindCallback}, but the
   * callback is expected to be of type `callback(error, result)`.</span>
   *
   * `bindNodeCallback` is not an operator because its input and output are not
   * Observables. The input is a function `func` with some parameters, but the
   * last parameter must be a callback function that `func` calls when it is
   * done. The callback function is expected to follow Node.js conventions,
   * where the first argument to the callback is an error, while remaining
   * arguments are the callback result. The output of `bindNodeCallback` is a
   * function that takes the same parameters as `func`, except the last one (the
   * callback). When the output function is called with arguments, it will
   * return an Observable where the results will be delivered to.
   *
   * @example <caption>Read a file from the filesystem and get the data as an Observable</caption>
   * import * as fs from 'fs';
   * var readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile);
   * var result = readFileAsObservable('./roadNames.txt', 'utf8');
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @see {@link bindCallback}
   * @see {@link from}
   * @see {@link fromPromise}
   *
   * @param {function} func Function with a callback as the last parameter.
   * @param {function} [selector] A function which takes the arguments from the
   * callback and maps those a value to emit on the output Observable.
   * @param {Scheduler} [scheduler] The scheduler on which to schedule the
   * callbacks.
   * @return {function(...params: *): Observable} A function which returns the
   * Observable that delivers the same values the Node.js callback would
   * deliver.
   * @static true
   * @name bindNodeCallback
   * @owner Observable
   */
  static create<T>(func: Function,
                   selector: Function | void = undefined,
                   scheduler?: Scheduler): (...args: any[]) => Observable<T> {
    return (...args: any[]): Observable<T> => {
      return new BoundNodeCallbackObservable<T>(func, <any>selector, args, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              public scheduler: Scheduler) {
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
          const err = innerArgs.shift();

          if (err) {
            subject.error(err);
          } else if (selector) {
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
      return scheduler.schedule(dispatch, 0, { source: this, subscriber });
    }
  }
}

interface DispatchState<T> {
  source: BoundNodeCallbackObservable<T>;
  subscriber: Subscriber<T>;
}

function dispatch<T>(this: Action<DispatchState<T>>, state: DispatchState<T>) {
  const self = (<Subscription> this);
  const { source, subscriber } = state;
  // XXX: cast to `any` to access to the private field in `source`.
  const { callbackFunc, args, scheduler } = source as any;
  let subject = source.subject;

  if (!subject) {
    subject = source.subject = new AsyncSubject<T>();

    const handler = function handlerFn(this: any, ...innerArgs: any[]) {
      const source = (<any>handlerFn).source;
      const { selector, subject } = source;
      const err = innerArgs.shift();

      if (err) {
        subject.error(err);
      } else if (selector) {
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
