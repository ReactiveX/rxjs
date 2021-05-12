import { EMPTY } from '../observable/empty';
import { MonoTypeOperatorFunction } from '../types';
import { identity } from '../util/identity';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits only the first `count` values emitted by the source Observable.
 *
 * <span class="informal">Takes the first `count` values from the source, then
 * completes.</span>
 *
 * ![](take.png)
 *
 * `take` returns an Observable that emits only the first `count` values emitted
 * by the source Observable. If the source emits fewer than `count` values then
 * all of its values are emitted. After that, it completes, regardless if the
 * source completes.
 *
 * Non-integer `count`s are floored. `NaN` is treated as `0`. A `count` greater
 * than or equal to `Number.MAX_SAFE_INTEGER + 1` (including
 * `Number.POSITIVE_INFINITY` and `Infinity`) is interpreted as "take
 * everything" turning this operator into a noop.
 *
 * ## Example
 * Take the first 5 seconds of an infinite 1-second interval Observable
 * ```ts
 * import { interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const intervalCount = interval(1000);
 * const takeFive = intervalCount.pipe(take(5));
 * takeFive.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * ```
 *
 * @see {@link takeLast}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @param count The maximum number of `next` values to emit.
 * @return A function that returns an Observable that emits only the first
 * `count` values emitted by the source Observable, or all of the values from
 * the source if the source emits fewer than `count` values.
 */
export function take<T>(count: number): MonoTypeOperatorFunction<T> {
  // this condition also returns true on left-side NaN and not just if count
  // is smaller than one. in both cases we take no value and that is the same as
  // EMPTY
  if (!(count >= 1)) {
    return () => EMPTY;
  }

  // this condition also returns true on left-side Infinity. the runtime can not
  // count beyond Number.MAX_SAFE_INTEGER so "seen" would be stuck at
  // Number.MAX_SAFE_INTEGER + 1, which would take everything from source
  // anyway. therefore we can just return the source and avoid the useless
  // counting
  if (count >= Number.MAX_SAFE_INTEGER + 1) {
    return identity;
  }

  count = Math.floor(count);

  return operate((source, subscriber) => {
    let seen = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        // Increment the number of values we have seen,
        // then check it against the allowed count to see
        // if we are still letting values through.
        if (++seen <= count) {
          subscriber.next(value);
          // If we have met or passed our allowed count,
          // we need to complete. We have to do <= here,
          // because re-entrant code will increment `seen` twice.
          if (count <= seen) {
            subscriber.complete();
          }
        }
      })
    );
  });
}
