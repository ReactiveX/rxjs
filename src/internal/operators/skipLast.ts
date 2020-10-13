/** @prettier */
import { MonoTypeOperatorFunction } from '../types';
import { identity } from '../util/identity';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Skip the last `count` values emitted by the source Observable.
 *
 * ![](skipLast.png)
 *
 * `skipLast` returns an Observable that accumulates a queue with a length
 * enough to store the first `count` values. As more values are received,
 * values are taken from the front of the queue and produced on the result
 * sequence. This causes values to be delayed.
 *
 * ## Example
 * Skip the last 2 values of an Observable with many values
 * ```ts
 * import { range } from 'rxjs';
 * import { skipLast } from 'rxjs/operators';
 *
 * const many = range(1, 5);
 * const skipLastTwo = many.pipe(skipLast(2));
 * skipLastTwo.subscribe(x => console.log(x));
 *
 * // Results in:
 * // 1 2 3
 * ```
 *
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipWhile}
 * @see {@link take}
 *
 * @throws {ArgumentOutOfRangeError} When using `skipLast(i)`, it throws
 * ArgumentOutOrRangeError if `i < 0`.
 *
 * @param {number} skipCount Number of elements to skip from the end of the source Observable.
 * @returns {Observable<T>} An Observable that skips the last count values
 * emitted by the source Observable.
 */
export function skipLast<T>(skipCount: number): MonoTypeOperatorFunction<T> {
  // For skipCounts less than or equal to zero, we are just mirroring the source.
  return skipCount <= 0
    ? identity
    : operate((source, subscriber) => {
        // A ring buffer to hold the values while we wait to see
        // if we can emit it or it's part of the "skipped" last values.
        // Note that it is the _same size_ as the skip count.
        let ring: T[] = new Array(skipCount);
        let count = 0;
        source.subscribe(
          new OperatorSubscriber(
            subscriber,
            (value) => {
              // Move us to the next slot in the ring buffer.
              const currentCount = count++;
              if (currentCount < skipCount) {
                // Fill the ring first
                ring[currentCount] = value;
              } else {
                const index = currentCount % skipCount;
                // Pull the oldest value out and emit it,
                // then stuff the new value in it's place.
                const oldValue = ring[index];
                ring[index] = value;
                subscriber.next(oldValue);
              }
            },
            undefined,
            undefined,
            () =>
              // Free up memory
              (ring = null!)
          )
        );
      });
}
