import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { IScheduler } from '../Scheduler';
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
  static create(callbackFunc: (callback: () => any) => any, selector?: void, scheduler?: IScheduler): () => Observable<void>;
  static create<R>(callbackFunc: (callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<R>(callbackFunc: (callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
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
   * done.
   *
   * The output of `bindCallback` is a function that takes the same parameters
   * as `func`, except the last one (the callback). When the output function
   * is called with arguments, it will return an Observable. If `func` function
   * calls its callback with one argument, the Observable will emit that value.
   * If on the other hand callback is called with multiple values, resulting
   * Observable will emit an array with these arguments.
   *
   * It is very important to remember, that input function `func` is not called
   * when output function is, but rather when Observable returned by output
   * function is subscribed. This means if `func` makes AJAX request, that request
   * will be made every time someone subscribes to resulting Observable, but not before.
   *
   * Optionally, selector function can be passed to `bindObservable`. That function
   * takes the same arguments as callback, and returns value
   * that will be emitted by Observable instead of callback parameters themselves.
   * Even though by default multiple arguments passed to callback appear in the stream as array,
   * selector function will be called with arguments directly, just as callback would.
   * This means you can imagine default selector (when one is not provided explicitly)
   * as function that aggregates all its arguments into array, or simply returns first argument,
   * if there is only one.
   *
   * Last optional parameter - {@link Scheduler} - can be used to control when call
   * to `func` happens after someone subscribes to Observable, as well as when results
   * passed to callback will be emitted. By default subscription to Observable calls `func`
   * synchronously, but using `Scheduler.async` as last parameter will defer call to input function,
   * just like wrapping that call in `setTimeout` with time `0` would. So if you use async Scheduler
   * and call `subscribe` on output Observable, all function calls that are currently executing,
   * will end before `func` is invoked.
   *
   * When it comes to emitting results passed to callback, by default they are emitted
   * immediately after `func` invokes callback. In particular, if callback is called synchronously,
   * then subscription to resulting Observable will call `next` function synchronously as well.
   * If you want to defer that call, using `Scheduler.async` will, again, do the job.
   * This means that by using `Scheduler.async` you can, in a sense, ensure that `func`
   * always calls its callback asynchronously, thus avoiding terrifying Zalgo.
   *
   * Note that Observable created by output function will always emit only one value
   * and then complete right after. Even if `func` calls callback multiple times, values from
   * second and following calls will never appear in the stream. If you need to
   * listen for multiple calls, you probably want to use {@link fromEvent} or
   * {@link fromEventPattern} instead.
   *
   * If `func` depends on some context (`this` property), that context will be set
   * to the same context that output function has at call time. In particular, if `func`
   * is called as method of some object, in order to preserve proper behaviour,
   * it is recommended to set context of output function to that object as well,
   * provided `func` is not already bound.
   *
   * If input function calls its callback in "node style" (i.e. first argument to callback is
   * optional error parameter signaling whether call failed or not), {@link bindNodeCallback}
   * provides convenient error handling and probably is a better choice.
   * `bindCallback` will treat such functions without any difference and error parameter
   * (whether passed or not) will always be interpreted as regular callback argument.
   *
   *
   * @example <caption>Convert jQuery's getJSON to an Observable API</caption>
   * // Suppose we have jQuery.getJSON('/my/url', callback)
   * var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
   * var result = getJSONAsObservable('/my/url');
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   *
   * @example <caption>Receive array of arguments passed to callback</caption>
   * someFunction((a, b, c) => {
   *   console.log(a); // 5
   *   console.log(b); // 'some string'
   *   console.log(c); // {someProperty: 'someValue'}
   * });
   *
   * const boundSomeFunction = Rx.Observable.bindCallback(someFunction);
   * boundSomeFunction().subscribe(values => {
   *   console.log(values) // [5, 'some string', {someProperty: 'someValue'}]
   * });
   *
   *
   * @example <caption>Use bindCallback with selector function</caption>
   * someFunction((a, b, c) => {
   *   console.log(a); // 'a'
   *   console.log(b); // 'b'
   *   console.log(c); // 'c'
   * });
   *
   * const boundSomeFunction = Rx.Observable.bindCallback(someFunction, (a, b, c) => a + b + c);
   * boundSomeFunction().subscribe(value => {
   *   console.log(value) // 'abc'
   * });
   *
   *
   * @example <caption>Compare behaviour with and without async Scheduler</caption>
   * function iCallMyCallbackSynchronously(cb) {
   *   cb();
   * }
   *
   * const boundSyncFn = Rx.Observable.bindCallback(iCallMyCallbackSynchronously);
   * const boundAsyncFn = Rx.Observable.bindCallback(iCallMyCallbackSynchronously, null, Rx.Scheduler.async);
   *
   * boundSyncFn().subscribe(() => console.log('I was sync!'));
   * boundAsyncFn().subscribe(() => console.log('I was async!'));
   * console.log('This happened...');
   *
   * // Logs:
   * // I was sync!
   * // This happened...
   * // I was async!
   *
   *
   * @example <caption>Use bindCallback on object method</caption>
   * const boundMethod = Rx.Observable.bindCallback(someObject.methodWithCallback);
   * boundMethod.call(someObject) // make sure methodWithCallback has access to someObject
   * .subscribe(subscriber);
   *
   *
   * @see {@link bindNodeCallback}
   * @see {@link from}
   * @see {@link fromPromise}
   *
   * @param {function} func Function with a callback as the last parameter.
   * @param {function} [selector] A function which takes the arguments from the
   * callback and maps those to a value to emit on the output Observable.
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
                   scheduler?: IScheduler): (...args: any[]) => Observable<T> {
    return function(this: any, ...args: any[]): Observable<T> {
      return new BoundCallbackObservable<T>(func, <any>selector, args, this, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              private context: any,
              private scheduler: IScheduler) {
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
            subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
            subject.complete();
          }
        };
        // use named function instance to avoid closure.
        (<any>handler).source = this;

        const result = tryCatch(callbackFunc).apply(this.context, args.concat(handler));
        if (result === errorObject) {
          subject.error(errorObject.e);
        }
      }
      return subject.subscribe(subscriber);
    } else {
      return scheduler.schedule(BoundCallbackObservable.dispatch, 0, { source: this, subscriber, context: this.context });
    }
  }

  static dispatch<T>(state: { source: BoundCallbackObservable<T>, subscriber: Subscriber<T>, context: any }) {
    const self = (<Subscription><any>this);
    const { source, subscriber, context } = state;
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
          const value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
          self.add(scheduler.schedule(dispatchNext, 0, { value, subject }));
        }
      };
      // use named function to pass values in without closure
      (<any>handler).source = source;

      const result = tryCatch(callbackFunc).apply(context, args.concat(handler));
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
