import { EMPTY } from '../observable/empty.js';
import type { MonoTypeOperatorFunction } from '../types.js';
import { Observable, operate } from '@rxjs/observable';

/**
 * Waits for the source to complete, then emits the last N values from the source,
 * as specified by the `count` argument.
 *
 * ![](takeLast.png)
 *
 * `takeLast` results in an observable that will hold values up to `count` values in memory,
 * until the source completes. It then pushes all values in memory to the consumer, in the
 * order they were received from the source, then notifies the consumer that it is
 * complete.
 *
 * If for some reason the source completes before the `count` supplied to `takeLast` is reached,
 * all values received until that point are emitted, and then completion is notified.
 *
 * **Warning**: Using `takeLast` with an observable that never completes will result
 * in an observable that never emits a value.
 *
 * ## Example
 *
 * Take the last 3 values of an Observable with many values
 *
 * ```ts
 * import { range, takeLast } from 'rxjs';
 *
 * const many = range(1, 100);
 * const lastThree = many.pipe(takeLast(3));
 * lastThree.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link take}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @param count The maximum number of values to emit from the end of
 * the sequence of values emitted by the source Observable.
 * @return A function that returns an Observable that emits at most the last
 * `count` values emitted by the source Observable.
 */
export function takeLast<T>(count: number): MonoTypeOperatorFunction<T> {
  return count <= 0
    ? () => EMPTY
    : (source) =>
        new Observable((destination) => {
          // This is a ring buffer that will hold our values
          let ring = new Array<T>(count);
          // This counter is how we track where we are at in the ring buffer.
          let counter = 0;
          source.subscribe(
            operate({
              destination,
              next: (value) => {
                ring[counter++ % count] = value;
              },
              complete: () => {
                // We need to loop through our ring buffer.
                // If we haven't filled the buffer yet, we can start at zero.
                const start = count <= counter ? counter : 0;
                // Only need to emit however many values we've seen,
                // up to the expected count
                const total = Math.min(count, counter);
                for (let n = 0; n < total; n++) {
                  // The tricky bit here is we're incrementing `n`, and moving
                  // through our ring buffer, starting at the `start` index we
                  // found above. The `% count` will "wrap" us around to read
                  // the remaining values, if necessary.
                  destination.next(ring[(start + n) % count]);
                }
                // All done. This will also trigger clean up.
                destination.complete();
              },
              finalize: () => {
                // During finalization release the values in our buffer.
                ring = null!;
              },
            })
          );
        });
}
