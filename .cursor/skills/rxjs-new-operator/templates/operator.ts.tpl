import type { OperatorFunction } from '../types.js';
import { Observable, operate } from '@rxjs/observable';

/**
 * TODO: informal one-line summary.
 *
 * <span class="informal">TODO: plain-language description.</span>
 *
 * ![](__OPERATOR__.png)
 *
 * TODO: longer description.
 *
 * ## Example
 *
 * ```ts
 * import { of, __OPERATOR__ } from 'rxjs';
 *
 * of(1, 2, 3).pipe(__OPERATOR__()).subscribe(console.log);
 * ```
 *
 * @param TODO
 * @return A function that returns an Observable.
 */
export function __OPERATOR__<T>(/* TODO: parameters */): OperatorFunction<T, T> {
  return (source) =>
    new Observable((destination) => {
      source.subscribe(
        operate({
          destination,
          next: (value: T) => {
            // TODO: implement
            destination.next(value);
          },
        })
      );
    });
}
