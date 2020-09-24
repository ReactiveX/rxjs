import { subscribeToArray } from '../util/subscribeToArray';
import { subscribeToPromise } from '../util/subscribeToPromise';
import { subscribeToIterable } from '../util/subscribeToIterable';
import { subscribeToObservable } from '../util/subscribeToObservable';
import { isArrayLike } from '../util/isArrayLike';
import { isPromise } from '../util/isPromise';
import { isObject } from '../util/isObject';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { observable as Symbol_observable } from '../symbol/observable';
import { Subscription } from '../Subscription';
import { Subscriber } from '../Subscriber';
import { subscribeToAsyncIterable } from '../util/subscribeToAsyncIterable';

import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf } from '../types';
import { scheduled } from '../scheduled/scheduled';

export function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
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
 * @name from
 * @owner Observable
 */
export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
  if (!scheduler) {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable<T>(subscribeTo(input));
  } else {
    return scheduled(input, scheduler);
  }
}

function subscribeTo<T>(result: ObservableInput<T>): (subscriber: Subscriber<T>) => Subscription | void {
  if (result && typeof (result as any)[Symbol_observable] === 'function') {
    return subscribeToObservable(result as any);
  } else if (isArrayLike(result)) {
    return subscribeToArray(result);
  } else if (isPromise(result)) {
    return subscribeToPromise(result);
  } else if (result && typeof (result as any)[Symbol_iterator] === 'function') {
    return subscribeToIterable(result as any);
  } else if (
    Symbol && Symbol.asyncIterator &&
    !!result && typeof (result as any)[Symbol.asyncIterator] === 'function'
  ) {
    return subscribeToAsyncIterable(result as any);
  } else {
    const value = isObject(result) ? 'an invalid object' : `'${result}'`;
    const msg = `You provided ${value} where a stream was expected.`
      + ' You can provide an Observable, Promise, Array, AsyncIterable, or Iterable.';
    throw new TypeError(msg);
  }
}
