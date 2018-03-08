import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { AsyncSubject } from '../AsyncSubject';
import { Subscriber } from '../Subscriber';
import { Action } from '../scheduler/Action';

// tslint:disable:max-line-length
export function bindCallback(callbackFunc: (callback: () => any) => any, scheduler?: IScheduler): () => Observable<void>;
export function bindCallback<R>(callbackFunc: (callback: (result: R) => any) => any, scheduler?: IScheduler): () => Observable<R>;
export function bindCallback<T, R>(callbackFunc: (v1: T, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T) => Observable<R>;
export function bindCallback<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
export function bindCallback<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
export function bindCallback<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
export function bindCallback<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
export function bindCallback<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
export function bindCallback<T>(callbackFunc: Function, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
// tslint:enable:max-line-length

/**
 * Converts a callback API to a function that returns an Observable.
 *
 * <span class="informal">Give it a function `f` of type `f(x, callback)` and
 * it will return a function `g` that when called as `g(x)` will output an
 * Observable.</span>
 *
 * `bindCallback` is not an operator because its input and output are not
 * Observables. The input is a function `func` with some parameters, the
 * last parameter must be a callback function that `func` calls when it is
 * done.
 *
 * The output of `bindCallback` is a function that takes the same parameters
 * as `func`, except the last one (the callback). When the output function
 * is called with arguments it will return an Observable. If function `func`
 * calls its callback with one argument the Observable will emit that value.
 * If on the other hand the callback is called with multiple values the resulting
 * Observable will emit an array with said values as arguments.
 *
 * It is very important to remember that input function `func` is not called
 * when the output function is, but rather when the Observable returned by the output
 * function is subscribed. This means if `func` makes an AJAX request, that request
 * will be made every time someone subscribes to the resulting Observable, but not before.
 *
 * The last optional parameter - {@link Scheduler} - can be used to control when the call
 * to `func` happens after someone subscribes to Observable, as well as when results
 * passed to callback will be emitted. By default, the subscription to  an Observable calls `func`
 * synchronously, but using `Scheduler.async` as the last parameter will defer the call to `func`,
 * just like wrapping the call in `setTimeout` with a timeout of `0` would. If you use the async Scheduler
 * and call `subscribe` on the output Observable all function calls that are currently executing
 * will end before `func` is invoked.
 *
 * By default results passed to the callback are emitted immediately after `func` invokes the callback.
 * In particular, if the callback is called synchronously the subscription of the resulting Observable
 * will call the `next` function synchronously as well.  If you want to defer that call,
 * you may use `Scheduler.async` just as before.  This means that by using `Scheduler.async` you can
 * ensure that `func` always calls its callback asynchronously, thus avoiding terrifying Zalgo.
 *
 * Note that the Observable created by the output function will always emit a single value
 * and then complete immediately. If `func` calls the callback multiple times, values from subsequent
 * calls will not appear in the stream. If you need to listen for multiple calls,
 *  you probably want to use {@link fromEvent} or {@link fromEventPattern} instead.
 *
 * If `func` depends on some context (`this` property) and is not already bound the context of `func`
 * will be the context that the output function has at call time. In particular, if `func`
 * is called as a method of some objec and if `func` is not already bound, in order to preserve the context
 * it is recommended that the context of the output function is set to that object as well.
 *
 * If the input function calls its callback in the "node style" (i.e. first argument to callback is
 * optional error parameter signaling whether the call failed or not), {@link bindNodeCallback}
 * provides convenient error handling and probably is a better choice.
 * `bindCallback` will treat such functions the same as any other and error parameters
 * (whether passed or not) will always be interpreted as regular callback argument.
 *
 *
 * @example <caption>Convert jQuery's getJSON to an Observable API</caption>
 * // Suppose we have jQuery.getJSON('/my/url', callback)
 * var getJSONAsObservable = bindCallback(jQuery.getJSON);
 * var result = getJSONAsObservable('/my/url');
 * result.subscribe(x => console.log(x), e => console.error(e));
 *
 *
 * @example <caption>Receive an array of arguments passed to a callback</caption>
 * someFunction((a, b, c) => {
 *   console.log(a); // 5
 *   console.log(b); // 'some string'
 *   console.log(c); // {someProperty: 'someValue'}
 * });
 *
 * const boundSomeFunction = bindCallback(someFunction);
 * boundSomeFunction().subscribe(values => {
 *   console.log(values) // [5, 'some string', {someProperty: 'someValue'}]
 * });
 *
 *
 * @example <caption>Compare behaviour with and without async Scheduler</caption>
 * function iCallMyCallbackSynchronously(cb) {
 *   cb();
 * }
 *
 * const boundSyncFn = bindCallback(iCallMyCallbackSynchronously);
 * const boundAsyncFn = bindCallback(iCallMyCallbackSynchronously, null, Rx.Scheduler.async);
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
 * @example <caption>Use bindCallback on an object method</caption>
 * const boundMethod = bindCallback(someObject.methodWithCallback);
 * boundMethod.call(someObject) // make sure methodWithCallback has access to someObject
 * .subscribe(subscriber);
 *
 *
 * @see {@link bindNodeCallback}
 * @see {@link from}
 * @see {@link fromPromise}
 *
 * @param {function} func A function with a callback as the last parameter.
 * @param {Scheduler} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the callback would deliver.
 * @name bindCallback
 */
export function bindCallback<T>(callbackFunc: Function,
                                scheduler?: IScheduler): (...args: any[]) => Observable<T> {
  return function (this: any, ...args: any[]): Observable<T> {
    const context = this;
    let subject: AsyncSubject<T>;
    const params = {
      context,
      subject,
      callbackFunc,
      scheduler,
    };
    return new Observable<T>(subscriber => {
      if (!scheduler) {
        if (!subject) {
          subject = new AsyncSubject<T>();
          const handler = (...innerArgs: any[]) => {
            subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
            subject.complete();
          };

          try {
            callbackFunc.apply(context, [...args, handler]);
          } catch (err) {
            subject.error(err);
          }
        }
        return subject.subscribe(subscriber);
      } else {
        const state: DispatchState<T> = {
          args, subscriber, params,
        };
        return scheduler.schedule<DispatchState<T>>(dispatch, 0, state);
      }
    });
  };
}

interface DispatchState<T> {
  args: any[];
  subscriber: Subscriber<T>;
  params: ParamsContext<T>;
}

interface ParamsContext<T> {
  callbackFunc: Function;
  scheduler: IScheduler;
  context: any;
  subject: AsyncSubject<T>;
}

function dispatch<T>(this: Action<DispatchState<T>>, state: DispatchState<T>) {
  const self = this;
  const { args, subscriber, params } = state;
  const { callbackFunc, context, scheduler } = params;
  let { subject } = params;
  if (!subject) {
    subject = params.subject = new AsyncSubject<T>();

    const handler = (...innerArgs: any[]) => {
      const value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
      this.add(scheduler.schedule<NextState<T>>(dispatchNext, 0, { value, subject }));
    };

    try {
      callbackFunc.apply(context, [...args, handler]);
    } catch (err) {
      subject.error(err);
    }
  }

  this.add(subject.subscribe(subscriber));
}

interface NextState<T> {
  subject: AsyncSubject<T>;
  value: T;
}

function dispatchNext<T>(this: Action<NextState<T>>, state: NextState<T>) {
  const { value, subject } = state;
  subject.next(value);
  subject.complete();
}

interface ErrorState<T> {
  subject: AsyncSubject<T>;
  err: any;
}

function dispatchError<T>(this: Action<ErrorState<T>>, state: ErrorState<T>) {
  const { err, subject } = state;
  subject.error(err);
}
