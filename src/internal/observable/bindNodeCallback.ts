/** @prettier */
import { AsyncSubject } from '../AsyncSubject';
import { Observable } from '../Observable';
import { observeOn } from '../operators/observeOn';
import { SchedulerLike } from '../types';
import { isScheduler } from '../util/isScheduler';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';

/** @deprecated resultSelector is deprecated, pipe to map instead */
export function bindNodeCallback(
  callbackFunc: Function,
  resultSelector: Function,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any>;

export function bindNodeCallback<R1, R2, R3, R4>(
  callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<R1, R2, R3>(
  callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): () => Observable<[R1, R2, R3]>;
export function bindNodeCallback<R1, R2>(
  callbackFunc: (callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): () => Observable<[R1, R2]>;
export function bindNodeCallback<R1>(
  callbackFunc: (callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): () => Observable<R1>;
export function bindNodeCallback(callbackFunc: (callback: (err: any) => any) => any, scheduler?: SchedulerLike): () => Observable<void>;

export function bindNodeCallback<A1, R1, R2, R3, R4>(
  callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<A1, R1, R2, R3>(
  callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1) => Observable<[R1, R2, R3]>;
export function bindNodeCallback<A1, R1, R2>(
  callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1) => Observable<[R1, R2]>;
export function bindNodeCallback<A1, R1>(
  callbackFunc: (arg1: A1, callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1) => Observable<R1>;
export function bindNodeCallback<A1>(
  callbackFunc: (arg1: A1, callback: (err: any) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1) => Observable<void>;

export function bindNodeCallback<A1, A2, R1, R2, R3, R4>(
  callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<A1, A2, R1, R2, R3>(
  callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2) => Observable<[R1, R2, R3]>;
export function bindNodeCallback<A1, A2, R1, R2>(
  callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2) => Observable<[R1, R2]>;
export function bindNodeCallback<A1, A2, R1>(
  callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2) => Observable<R1>;
export function bindNodeCallback<A1, A2>(
  callbackFunc: (arg1: A1, arg2: A2, callback: (err: any) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2) => Observable<void>;

export function bindNodeCallback<A1, A2, A3, R1, R2, R3, R4>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<A1, A2, A3, R1, R2, R3>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2, R3]>;
export function bindNodeCallback<A1, A2, A3, R1, R2>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2]>;
export function bindNodeCallback<A1, A2, A3, R1>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3) => Observable<R1>;
export function bindNodeCallback<A1, A2, A3>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3) => Observable<void>;

export function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3, R4>(
  callbackFunc: (
    arg1: A1,
    arg2: A2,
    arg3: A3,
    arg4: A4,
    callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any
  ) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2, R3]>;
export function bindNodeCallback<A1, A2, A3, A4, R1, R2>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2]>;
export function bindNodeCallback<A1, A2, A3, A4, R1>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<R1>;
export function bindNodeCallback<A1, A2, A3, A4>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<void>;

export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3, R4>(
  callbackFunc: (
    arg1: A1,
    arg2: A2,
    arg3: A3,
    arg4: A4,
    arg5: A5,
    callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any
  ) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any[]>;
export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2, R3]>;
export function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2]>;
export function bindNodeCallback<A1, A2, A3, A4, A5, R1>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<R1>;
export function bindNodeCallback<A1, A2, A3, A4, A5>(
  callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any) => any) => any,
  scheduler?: SchedulerLike
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<void>;

export function bindNodeCallback(callbackFunc: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
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
 * with proper `scheduler` provided as optional third parameter. {@link SchedulerLike}
 * can also control when values from callback will be emitted by Observable.
 * To find out more, check out documentation for {@link bindCallback}, where
 * {@link SchedulerLike} works exactly the same.
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
 * ## Examples
 * ###  Read a file from the filesystem and get the data as an Observable
 * ```ts
 * import * as fs from 'fs';
 * const readFileAsObservable = bindNodeCallback(fs.readFile);
 * const result = readFileAsObservable('./roadNames.txt', 'utf8');
 * result.subscribe(x => console.log(x), e => console.error(e));
 * ```
 *
 * ### Use on function calling callback with multiple arguments
 * ```ts
 * someFunction((err, a, b) => {
 *   console.log(err); // null
 *   console.log(a); // 5
 *   console.log(b); // "some string"
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(value => {
 *   console.log(value); // [5, "some string"]
 * });
 * ```
 *
 * ### Use on function calling callback in regular style
 * ```ts
 * someFunction(a => {
 *   console.log(a); // 5
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(
 *   value => {}             // never gets called
 *   err => console.log(err) // 5
 * );
 * ```
 *
 * @see {@link bindCallback}
 * @see {@link from}
 *
 * @param {function} func Function with a Node.js-style callback as the last parameter.
 * @param {SchedulerLike} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the Node.js callback would
 * deliver.
 * @name bindNodeCallback
 */
export function bindNodeCallback<T>(
  callbackFunc: Function,
  resultSelector?: Function | SchedulerLike,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any> {
  if (resultSelector) {
    if (isScheduler(resultSelector)) {
      scheduler = resultSelector;
    } else {
      // DEPRECATED PATH
      return function (this: any, ...args: any[]) {
        return bindNodeCallback(callbackFunc, scheduler)
          .apply(this, args)
          .pipe(mapOneOrManyArgs(resultSelector as any));
      };
    }
  }

  if (scheduler) {
    return function (this: any, ...args: any[]) {
      return bindNodeCallback(callbackFunc).apply(this, args).pipe(observeOn(scheduler!));
    };
  }

  // We're using AsyncSubject, because it emits when it completes,
  // and it will play the value to all late-arriving subscribers.
  const subject = new AsyncSubject<any>();

  return function (this: any, ...args: any[]): Observable<T> {
    // If this is true, then we haven't called our function yet.
    let uninitialized = true;
    return new Observable((subscriber) => {
      const subs = subject.subscribe(subscriber);
      if (uninitialized) {
        uninitialized = false;
        // We're going to execute the bound function
        // This bit is to signal that we are hitting the callback asychronously.
        // Because we don't have any anti-"Zalgo" gaurantees with whatever
        // function we are handed, we use this bit to figure out whether or not
        // we are getting hit in a callback synchronously during our call.
        let isAsync = false;

        // This is used to signal that the callback completed synchronously.
        let isComplete = false;

        // Call our function that has a callback. If at any time during this
        // call, an error is thrown, it will be caught by the Observable
        // subscription process and sent to the consumer.

        callbackFunc.apply(
          // Pass the appropriate `this` context.
          this,
          [
            // Pass the arguments.
            ...args,
            // And our callback handler.
            (err: any, ...rest: any[]) => {
              if (err != null) {
                subject.error(err);
              } else {
                // If we have one argument after the error, notify the consumer
                // of it as a single value, otherwise, if there's more than one, pass
                // them as an array. Note that if there are no arguments, `undefined`
                // will be emitted.
                subject.next(1 < rest.length ? rest : rest[0]);
                // Flip this flag, so we know we can complete it in the synchronous
                // case below.
                isComplete = true;
                // If we're not asynchronous, we need to defer the `complete` call
                // until after the call to the function is over. This is because an
                // error could be thrown in the function after it calls our callback,
                // and if that is the case, if we complete here, we are unable to notify
                // the consumer than an error occured.
                if (isAsync) {
                  subject.complete();
                }
              }
            },
          ]
        );
        // If we flipped `isComplete` during the call, we resolved synchronously,
        // notify complete, because we skipped it in the callback to wait
        // to make sure there were no errors during the call.
        if (isComplete) {
          subject.complete();
        }

        // We're no longer synchronous. If the callback is called at this point
        // we can notify complete on the spot.
        isAsync = true;
      }
      return subs;
    });
  };
}
