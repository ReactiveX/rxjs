import { Observable } from './Observable';
import { firstValueFrom } from './firstValueFrom';
import { toArray } from './operators/toArray';

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as it completes,
 * producing an array of all the values that the observable emitted. (If the
 * observable completes without emitting any values, the promise will resolve
 * with an empty array.)
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will complete. If
 * the source observable does not complete, you will end up with a promise
 * that is hung up, and potentially all the state of an async function hanging
 * out in memory. To avoid this situation, look into adding something like
 * {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * ## Example
 *
 * Wait for the first three values from a stream and emit them from a promise
 * in an async function
 *
 * ```ts
 * import { interval, take, firstValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000).pipe(take(3));
 *   const numbers = await allValuesFrom(source$);
 *   console.log(`The numbers are: ${ numbers.join(', ') }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The numbers are: 0, 1, 2'
 * ```
 *
 * Note that this function is equivalent to piping the observable through
 * {@link toArray} and then calling either {@link firstValueFrom} or
 * {@link lastValueFrom} (which are equivalent in this case).
 *
 * @see {@link firstValueFrom}
 * @see {@link lastValueFrom}
 * @see {@link toArray}
 *
 * @param source the observable to convert to a promise
 */
export function allValuesFrom<T>(source: Observable<T>): Promise<T[]> {
  return firstValueFrom(source.pipe(toArray()));
}
