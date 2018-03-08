import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { AsyncSubject } from '../AsyncSubject';
import { Subscriber } from '../Subscriber';
import { Action } from '../scheduler/Action';

/* tslint:disable:max-line-length */
export function bindNodeCallback<R>(callbackFunc: (callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): () => Observable<R>;
export function bindNodeCallback<T, R>(callbackFunc: (v1: T, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T) => Observable<R>;
export function bindNodeCallback<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
export function bindNodeCallback<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
export function bindNodeCallback<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
export function bindNodeCallback<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
export function bindNodeCallback<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (err: any, result: R) => any) => any, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
export function bindNodeCallback<T>(callbackFunc: Function, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
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
 * where the first argument to the callback is an error object, signaling
 * whether call was successful. If that object is passed to callback, it means
 * something went wrong.
 *
 * The output of `bindNodeCallback` is a function that takes the same
 * parameters as `func`, except the last one (the callback). When the output
 * function is called with arguments, it will return an Observable.
 * If `func` calls its callback with error parameter present, Observable will
 * error with that value as well. If error parameter is not passed, Observable will emit
 * second parameter. If there are more parameters (third and so on),
 * Observable will emit an array with all arguments, except first error argument.
 *
 * Note that `func` will not be called at the same time output function is,
 * but rather whenever resulting Observable is subscribed. By default call to
 * `func` will happen synchronously after subscription, but that can be changed
 * with proper {@link Scheduler} provided as optional third parameter. Scheduler
 * can also control when values from callback will be emitted by Observable.
 * To find out more, check out documentation for {@link bindCallback}, where
 * Scheduler works exactly the same.
 *
 * As in {@link bindCallback}, context (`this` property) of input function will be set to context
 * of returned function, when it is called.
 *
 * After Observable emits value, it will complete immediately. This means
 * even if `func` calls callback again, values from second and consecutive
 * calls will never appear on the stream. If you need to handle functions
 * that call callbacks multiple times, check out {@link fromEvent} or
 * {@link fromEventPattern} instead.
 *
 * Note that `bindNodeCallback` can be used in non-Node.js environments as well.
 * "Node.js-style" callbacks are just a convention, so if you write for
 * browsers or any other environment and API you use implements that callback style,
 * `bindNodeCallback` can be safely used on that API functions as well.
 *
 * Remember that Error object passed to callback does not have to be an instance
 * of JavaScript built-in `Error` object. In fact, it does not even have to an object.
 * Error parameter of callback function is interpreted as "present", when value
 * of that parameter is truthy. It could be, for example, non-zero number, non-empty
 * string or boolean `true`. In all of these cases resulting Observable would error
 * with that value. This means usually regular style callbacks will fail very often when
 * `bindNodeCallback` is used. If your Observable errors much more often then you
 * would expect, check if callback really is called in Node.js-style and, if not,
 * switch to {@link bindCallback} instead.
 *
 * Note that even if error parameter is technically present in callback, but its value
 * is falsy, it still won't appear in array emitted by Observable.
 *
 *
 * @example <caption>Read a file from the filesystem and get the data as an Observable</caption>
 * import * as fs from 'fs';
 * var readFileAsObservable = bindNodeCallback(fs.readFile);
 * var result = readFileAsObservable('./roadNames.txt', 'utf8');
 * result.subscribe(x => console.log(x), e => console.error(e));
 *
 *
 * @example <caption>Use on function calling callback with multiple arguments</caption>
 * someFunction((err, a, b) => {
 *   console.log(err); // null
 *   console.log(a); // 5
 *   console.log(b); // "some string"
 * });
 * var boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(value => {
 *   console.log(value); // [5, "some string"]
 * });
 *
 * @example <caption>Use on function calling callback in regular style</caption>
 * someFunction(a => {
 *   console.log(a); // 5
 * });
 * var boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(
 *   value => {}             // never gets called
 *   err => console.log(err) // 5
 * );
 *
 *
 * @see {@link bindCallback}
 * @see {@link from}
 * @see {@link fromPromise}
 *
 * @param {function} func Function with a Node.js-style callback as the last parameter.
 * @param {Scheduler} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the Node.js callback would
 * deliver.
 * @name bindNodeCallback
 */
export function bindNodeCallback<T>(callbackFunc: Function,
                                    scheduler?: IScheduler): (...args: any[]) => Observable<T> {
  return function(this: any, ...args: any[]): Observable<T> {
    const params: ParamsState<T> = {
      subject: undefined,
      args,
      callbackFunc,
      scheduler,
      context: this,
    };
    return new Observable<T>(subscriber => {
      const { context } = params;
      let { subject } = params;
      if (!scheduler) {
        if (!subject) {
          subject = params.subject = new AsyncSubject<T>();
          const handler = function handlerFn(this: any, ...innerArgs: any[]) {
            const err = innerArgs.shift();

            if (err) {
              subject.error(err);
              return;
            }

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
        return scheduler.schedule<DispatchState<T>>(dispatch, 0, { params, subscriber, context });
      }
    });
  };
}

interface DispatchState<T> {
  subscriber: Subscriber<T>;
  context: any;
  params: ParamsState<T>;
}

interface ParamsState<T> {
  callbackFunc: Function;
  args: any[];
  scheduler: IScheduler;
  subject: AsyncSubject<T>;
  context: any;
}

function dispatch<T>(this: Action<DispatchState<T>>, state: DispatchState<T>) {
  const { params, subscriber, context } = state;
  const { callbackFunc, args, scheduler } = params;
  let subject = params.subject;

  if (!subject) {
    subject = params.subject = new AsyncSubject<T>();

    const handler = (...innerArgs: any[]) => {
      const err = innerArgs.shift();
      if (err) {
        this.add(scheduler.schedule<DispatchErrorArg<T>>(dispatchError, 0, { err, subject }));
      } else {
        const value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
        this.add(scheduler.schedule<DispatchNextArg<T>>(dispatchNext, 0, { value, subject }));
      }
    };

    try {
      callbackFunc.apply(context, [...args, handler]);
    } catch (err) {
      this.add(scheduler.schedule<DispatchErrorArg<T>>(dispatchError, 0, { err, subject }));
    }
  }

  this.add(subject.subscribe(subscriber));
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
