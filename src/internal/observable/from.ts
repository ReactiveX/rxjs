import { isArrayLike } from '../util/isArrayLike';
import { isPromise } from '../util/isPromise';
import { observable as Symbol_observable } from '../symbol/observable';
import { Subscriber } from '../Subscriber';

import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf, ReadableStreamLike } from '../types';
import { scheduled } from '../scheduled/scheduled';
import { isFunction } from '../util/isFunction';
import { reportUnhandledError } from '../util/reportUnhandledError';
import { isInteropObservable } from '../util/isInteropObservable';
import { isAsyncIterable } from '../util/isAsyncIterable';
import { createInvalidObservableTypeError } from '../util/throwUnobservableError';
import { isIterable } from '../util/isIterable';
import { isReadableStreamLike, readableStreamLikeToAsyncGenerator } from '../util/isReadableStreamLike';

export function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
/** @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function from<O extends ObservableInput<any>>(input: O, scheduler: SchedulerLike): Observable<ObservedValueOf<O>>;

/**
 * Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.
 *
 * <span class="informal">Converts almost anything to an Observable.</span>
 *
 * ![](from.png)
 *
 * `from` converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable" target="_blank">iterable</a>
 * object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated
 * as an array of characters. Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
 * converted through this operator.
 *
 * ## Examples
 *
 * ### Converts an array to an Observable
 *
 * ```ts
 * import { from } from 'rxjs';
 *
 * const array = [10, 20, 30];
 * const result = from(array);
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 10
 * // 20
 * // 30
 * ```
 *
 * ---
 *
 * ### Convert an infinite iterable (from a generator) to an Observable
 *
 * ```ts
 * import { from } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * function* generateDoubles(seed) {
 *    let i = seed;
 *    while (true) {
 *      yield i;
 *      i = 2 * i; // double it
 *    }
 * }
 *
 * const iterator = generateDoubles(3);
 * const result = from(iterator).pipe(take(10));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 3
 * // 6
 * // 12
 * // 24
 * // 48
 * // 96
 * // 192
 * // 384
 * // 768
 * // 1536
 * ```
 *
 * ---
 *
 * ### With async scheduler
 *
 * ```ts
 * import { from, asyncScheduler } from 'rxjs';
 *
 * console.log('start');
 *
 * const array = [10, 20, 30];
 * const result = from(array, asyncScheduler);
 *
 * result.subscribe(x => console.log(x));
 *
 * console.log('end');
 *
 * // Logs:
 * // start
 * // end
 * // 10
 * // 20
 * // 30
 * ```
 *
 * @see {@link fromEvent}
 * @see {@link fromEventPattern}
 *
 * @param {ObservableInput<T>} A subscription object, a Promise, an Observable-like,
 * an Array, an iterable, or an array-like object to be converted.
 * @param {SchedulerLike} An optional {@link SchedulerLike} on which to schedule the emission of values.
 * @return {Observable<T>}
 */
export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}

// TODO: Use this throughout the library, rather than the `from` above, to avoid
// the unnecessary scheduling check and reduce bundled sizes of operators that use `from`.
// TODO: Eventually, this just becomes `from`, as we don't have the deprecated scheduled path anymore.
export function innerFrom<T>(input: ObservableInput<T>): Observable<T> {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }

  throw createInvalidObservableTypeError(input);
}

/**
 * Creates an RxJS Observable from an object that implements `Symbol.observable`.
 * @param obj An object that properly implements `Symbol.observable`.
 */
function fromInteropObservable<T>(obj: any) {
  return new Observable((subscriber: Subscriber<T>) => {
    const obs = obj[Symbol_observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    // Should be caught by observable subscribe function error handling.
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  });
}

/**
 * Synchronously emits the values of an array like and completes.
 * This is exported because there are creation functions and operators that need to
 * make direct use of the same logic, and there's no reason to make them run through
 * `from` conditionals because we *know* they're dealing with an array.
 * @param array The array to emit values from
 */
export function fromArrayLike<T>(array: ArrayLike<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    // Loop over the array and emit each value. Note two things here:
    // 1. We're making sure that the subscriber is not closed on each loop.
    //    This is so we don't continue looping over a very large array after
    //    something like a `take`, `takeWhile`, or other synchronous unsubscription
    //    has already unsubscribed.
    // 2. In this form, reentrant code can alter that array we're looping over.
    //    This is a known issue, but considered an edge case. The alternative would
    //    be to copy the array before executing the loop, but this has
    //    performance implications.
    for (let i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}

function fromPromise<T>(promise: PromiseLike<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    promise
      .then(
        (value) => {
          if (!subscriber.closed) {
            subscriber.next(value);
            subscriber.complete();
          }
        },
        (err: any) => subscriber.error(err)
      )
      .then(null, reportUnhandledError);
  });
}

function fromIterable<T>(iterable: Iterable<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    for (const value of iterable) {
      subscriber.next(value);
      if (subscriber.closed) {
        return;
      }
    }
    subscriber.complete();
  });
}

function fromAsyncIterable<T>(asyncIterable: AsyncIterable<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    process(asyncIterable, subscriber).catch((err) => subscriber.error(err));
  });
}

function fromReadableStreamLike<T>(readableStream: ReadableStreamLike<T>) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

async function process<T>(asyncIterable: AsyncIterable<T>, subscriber: Subscriber<T>) {
  for await (const value of asyncIterable) {
    subscriber.next(value);
    // A side-effect may have closed our subscriber,
    // check before the next iteration.
    if (subscriber.closed) {
      return;
    }
  }
  subscriber.complete();
}
