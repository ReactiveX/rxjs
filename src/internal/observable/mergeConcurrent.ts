import { ObservableInput, ObservedValuesFromArray } from '../types';
import { merge } from './merge';
import { Observable } from '../Observable';

/**
 * Subscribes to a series of observable sources, in order, but only so many at a time,
 * and merges their values into a single observable output.
 *
 * ### Merge together 3 Observables, but only 2 run concurrently
 * ```ts
 * import { mergeConcurrent, interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const timer1 = interval(1000).pipe(take(10));
 * const timer2 = interval(2000).pipe(take(6));
 * const timer3 = interval(500).pipe(take(10));
 * const limit = 2;
 * const merged = mergeConcurrent(limit, timer1, timer2, timer3);
 * merged.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - First timer1 and timer2 will run concurrently
 * // - timer1 will emit a value every 1000ms for 10 iterations
 * // - timer2 will emit a value every 2000ms for 6 iterations
 * // - after timer1 hits it's max iteration, timer2 will
 * //   continue, and timer3 will start to run concurrently with timer2
 * // - when timer2 hits it's max iteration it terminates, and
 * //   timer3 will continue to emit a value every 500ms until it is complete
 * ```
 * @param concurrencyLimit The number of observables to subscribe to simultaneously
 * @param sources The observable sources to subscribe to
 */
export function mergeConcurrent<O extends ObservableInput<any>, A extends O[]>(
  concurrencyLimit: number,
  ...sources: A
): Observable<ObservedValuesFromArray<A>> {
  const args = [...sources, concurrencyLimit];
  // TODO: have merge based on this, not the other way around.
  return merge(...(args as any)) as any;
}
