import { Observable } from '../Observable';
import { Falsy, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function some<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
export function some<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean>;

/**
 * Returns an Observable that emits whether or not some value emitted by the source satisfies the predicate function provided.
 *
 * <span class="informal">If some value passes the predicate before the source completes, emits true before completion,
 * otherwise emit false, then complete.</span>
 *
 * ![](some.svg)
 *
 *
 * ## Example
 *
 * Emitting true if source contains odd items, false otherwise.
 *
 * ```ts
 * import { of, some } from 'rxjs';
 *
 * of(2, 4, 5, 9)
 *  .pipe(some(x => x % 2 !== 0))
 *  .subscribe(x => console.log(x)); // true
 *
 * ```
 *
 * @param {function} predicate A function for determining if a value emitted by the
 * source Observable meets a specified condition.
 * @return A function that returns an Observable of booleans that determines if
 * some value from the source Observable meet the condition specified.
 */
export function some<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    let index = 0;
    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => {
          if (predicate(value, index++, source)) {
            subscriber.next(true);
            subscriber.complete();
          }
        },
        () => {
          subscriber.next(false);
          subscriber.complete();
        }
      )
    );
  });
}
