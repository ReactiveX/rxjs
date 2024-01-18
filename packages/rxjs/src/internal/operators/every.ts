import { Observable, operate } from '@rxjs/observable';
import type { Falsy, OperatorFunction } from '../types.js';

export function every<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
export function every<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, boolean>;

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 *
 * <span class="informal">If all values pass predicate before the source completes, emits true before completion,
 * otherwise emit false, then complete.</span>
 *
 * ![](every.png)
 *
 * ## Example
 *
 * A simple example emitting true if all elements are less than 5, false otherwise
 *
 * ```ts
 * import { of, every } from 'rxjs';
 *
 * of(1, 2, 3, 4, 5, 6)
 *   .pipe(every(x => x < 5))
 *   .subscribe(x => console.log(x)); // -> false
 * ```
 *
 * @param predicate A function for determining if an item meets a specified condition.
 * @param thisArg Optional object to use for `this` in the callback.
 * @return A function that returns an Observable of booleans that determines if
 * all items of the source Observable meet the condition specified.
 */
export function every<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, boolean> {
  return (source) =>
    new Observable((destination) => {
      let index = 0;

      const subscriber = operate({
        destination,
        next: (value: T) => {
          if (!predicate(value, index++)) {
            // To prevent re-entrancy issues, we unsubscribe from the
            // source as soon as possible. Because the `next` right below it
            // could cause us to re-enter before we get to `complete()`.
            subscriber.unsubscribe();
            destination.next(false);
            destination.complete();
          }
        },
        complete: () => {
          destination.next(true);
          destination.complete();
        },
      });

      source.subscribe(subscriber);
    });
}
