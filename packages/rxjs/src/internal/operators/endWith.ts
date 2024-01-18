/** prettier */
import { Observable, operate, subscribeToArray } from '@rxjs/observable';
import type { OperatorFunction, ValueFromArray } from '../types.js';

/**
 * Returns an observable that will emit all values from the source, then synchronously emit
 * the provided value(s) immediately after the source completes.
 *
 * This is useful for knowing when an observable ends. Particularly when paired with an
 * operator like {@link takeUntil}
 *
 * ![](endWith.png)
 *
 * ## Example
 *
 * Emit values to know when an interval starts and stops. The interval will
 * stop when a user clicks anywhere on the document.
 *
 * ```ts
 * import { interval, map, fromEvent, startWith, takeUntil, endWith } from 'rxjs';
 *
 * const ticker$ = interval(5000).pipe(
 *   map(() => 'tick')
 * );
 *
 * const documentClicks$ = fromEvent(document, 'click');
 *
 * ticker$.pipe(
 *   startWith('interval started'),
 *   takeUntil(documentClicks$),
 *   endWith('interval ended by click')
 * )
 * .subscribe(x => console.log(x));
 *
 * // Result (assuming a user clicks after 15 seconds)
 * // 'interval started'
 * // 'tick'
 * // 'tick'
 * // 'tick'
 * // 'interval ended by click'
 * ```
 *
 * @see {@link startWith}
 * @see {@link concat}
 * @see {@link takeUntil}
 *
 * @param values Items you want the modified Observable to emit last.
 * @return A function that returns an Observable that emits all values from the
 * source, then synchronously emits the provided value(s) immediately after the
 * source completes.
 */
export function endWith<T, A extends readonly unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>> {
  return (source) =>
    new Observable((destination) => {
      source.subscribe(
        operate({
          destination,
          complete: () => {
            subscribeToArray(values as readonly ValueFromArray<A>[], destination);
          },
        })
      );
    });
}
