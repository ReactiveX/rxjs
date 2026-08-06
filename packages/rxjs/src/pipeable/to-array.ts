import { subscribeToSource } from '../util/observable-helpers.js';
import { operate } from './operate.js';
import type { OperatorFunction } from './types.js';

/**
 * Collects every source value and emits one array when the source completes.
 *
 * Unlike the platform `Observable.prototype.toArray()`, this RxJS function
 * returns an Observable. Source errors are forwarded without emitting a
 * partial array, and cancellation discards the active collection.
 *
 * @typeParam In The source value type.
 * @returns A unary operator for use with `rx` or another composition helper.
 *
 * @example Collect values without crossing into a Promise
 * ```ts
 * import { rx, toArray } from 'rxjs';
 *
 * const collected = rx([1, 2, 3], toArray());
 * collected.subscribe(console.log); // [1, 2, 3]
 * ```
 */
export function toArray<In>(): OperatorFunction<In, In[]> {
  return operate((source, subscriber) => {
    const values: In[] = [];

    subscribeToSource(source, subscriber, {
      next(value) {
        values.push(value);
      },
      complete() {
        subscriber.next(values);
        subscriber.complete();
      },
    });
  });
}
