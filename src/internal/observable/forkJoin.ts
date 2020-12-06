/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput, ObservedValueOf, ObservableInputTuple } from '../types';
import { map } from '../operators/map';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { innerFrom } from './from';
import { popResultSelector } from '../util/args';

// forkJoin([a, b, c])
export function forkJoin(sources: readonly []): Observable<never>;
export function forkJoin<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is deprecated, pipe to map instead */
export function forkJoin<A extends readonly unknown[], R>(
  sources: readonly [...ObservableInputTuple<A>],
  resultSelector: (...values: A) => R
): Observable<R>;

// forkJoin(a, b, c)
/** @deprecated Use the version that takes an array of Observables instead */
export function forkJoin<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is deprecated, pipe to map instead */
export function forkJoin<A extends readonly unknown[], R>(
  ...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]
): Observable<R>;

// forkJoin({a, b, c})
export function forkJoin(sourcesObject: { [K in any]: never }): Observable<never>;
export function forkJoin<T>(sourcesObject: T): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

/**
 * Accepts an `Array` of {@link ObservableInput} or a dictionary `Object` of {@link ObservableInput} and returns
 * an {@link Observable} that emits either an array of values in the exact same order as the passed array,
 * or a dictionary of values in the same shape as the passed dictionary.
 *
 * <span class="informal">Wait for Observables to complete and then combine last values they emitted;
 * complete immediately if an empty array is passed.</span>
 *
 * ![](forkJoin.png)
 *
 * `forkJoin` is an operator that takes any number of input observables which can be passed either as an array
 * or a dictionary of input observables. If no input observables are provided (e.g. an empty array is passed),
 * then the resulting stream will complete immediately.
 *
 * `forkJoin` will wait for all passed observables to emit and complete and then it will emit an array or an object with last
 * values from corresponding observables.
 *
 * If you pass an array of `n` observables to the operator, then the resulting
 * array will have `n` values, where the first value is the last one emitted by the first observable,
 * second value is the last one emitted by the second observable and so on.
 *
 * If you pass a dictionary of observables to the operator, then the resulting
 * objects will have the same keys as the dictionary passed, with their last values they have emitted
 * located at the corresponding key.
 *
 * That means `forkJoin` will not emit more than once and it will complete after that. If you need to emit combined
 * values not only at the end of the lifecycle of passed observables, but also throughout it, try out {@link combineLatest}
 * or {@link zip} instead.
 *
 * In order for the resulting array to have the same length as the number of input observables, whenever any of
 * the given observables completes without emitting any value, `forkJoin` will complete at that moment as well
 * and it will not emit anything either, even if it already has some last values from other observables.
 * Conversely, if there is an observable that never completes, `forkJoin` will never complete either,
 * unless at any point some other observable completes without emitting a value, which brings us back to
 * the previous case. Overall, in order for `forkJoin` to emit a value, all given observables
 * have to emit something at least once and complete.
 *
 * If any given observable errors at some point, `forkJoin` will error as well and immediately unsubscribe
 * from the other observables.
 *
 * Optionally `forkJoin` accepts a `resultSelector` function, that will be called with values which normally
 * would land in the emitted array. Whatever is returned by the `resultSelector`, will appear in the output
 * observable instead. This means that the default `resultSelector` can be thought of as a function that takes
 * all its arguments and puts them into an array. Note that the `resultSelector` will be called only
 * when `forkJoin` is supposed to emit a result.
 *
 * ## Examples
 *
 * ### Use forkJoin with a dictionary of observable inputs
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin({
 *   foo: of(1, 2, 3, 4),
 *   bar: Promise.resolve(8),
 *   baz: timer(4000),
 * });
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // { foo: 4, bar: 8, baz: 0 } after 4 seconds
 * // "This is how it ends!" immediately after
 * ```
 *
 * ### Use forkJoin with an array of observable inputs
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin([
 *   of(1, 2, 3, 4),
 *   Promise.resolve(8),
 *   timer(4000),
 * ]);
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // [4, 8, 0] after 4 seconds
 * // "This is how it ends!" immediately after
 * ```
 *
 * @see {@link combineLatest}
 * @see {@link zip}
 *
 * @param {...ObservableInput} args Any number of Observables provided either as an array or as an arguments
 * passed directly to the operator.
 * @param {function} [project] Function that takes values emitted by input Observables and returns value
 * that will appear in resulting Observable instead of default array.
 * @return {Observable} Observable emitting either an array of last values emitted by passed Observables
 * or value from project function.
 */
export function forkJoin(...args: any[]): Observable<any> {
  const resultSelector = popResultSelector(args);

  const { args: sources, keys } = argsArgArrayOrObject(args);

  if (resultSelector) {
    // deprecated path.
    return forkJoinInternal(sources, keys).pipe(map((values: any[]) => resultSelector!(...values)));
  }

  return forkJoinInternal(sources, keys);
}

function forkJoinInternal(sources: ObservableInput<any>[], keys: string[] | null): Observable<any> {
  return new Observable((subscriber) => {
    const len = sources.length;
    if (len === 0) {
      subscriber.complete();
      return;
    }
    const values = new Array(len);
    let completed = 0;
    let emitted = 0;
    for (let sourceIndex = 0; sourceIndex < len; sourceIndex++) {
      const source = innerFrom(sources[sourceIndex]);
      let hasValue = false;
      subscriber.add(
        source.subscribe({
          next: (value) => {
            if (!hasValue) {
              hasValue = true;
              emitted++;
            }
            values[sourceIndex] = value;
          },
          error: (err) => subscriber.error(err),
          complete: () => {
            completed++;
            if (completed === len || !hasValue) {
              if (emitted === len) {
                subscriber.next(keys ? keys.reduce((result, key, i) => (((result as any)[key] = values[i]), result), {}) : values);
              }
              subscriber.complete();
            }
          },
        })
      );
    }
  });
}
