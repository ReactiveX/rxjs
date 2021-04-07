import { Subscription } from '../Subscription';
import { EMPTY } from '../observable/empty';
import { operate } from '../util/lift';
import { MonoTypeOperatorFunction } from '../types';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that will resubscribe to the source stream when the source stream completes, at most count times.
 *
 * <span class="informal">Repeats all values emitted on the source. It's like {@link retry}, but for non error cases.</span>
 *
 * ![](repeat.png)
 *
 * Similar to {@link retry}, this operator repeats the stream of items emitted by the source for non error cases.
 * Repeat can be useful for creating observables that are meant to have some repeated pattern or rhythm.
 *
 * Note: `repeat(0)` returns an empty observable and `repeat()` will repeat forever
 *
 * ## Example
 * Repeat a message stream
 * ```ts
 * import { of } from 'rxjs';
 * import { repeat, delay } from 'rxjs/operators';
 *
 * const source = of('Repeat message');
 * const example = source.pipe(repeat(3));
 * example.subscribe(x => console.log(x));
 *
 * // Results
 * // Repeat message
 * // Repeat message
 * // Repeat message
 * ```
 *
 * Repeat 3 values, 2 times
 * ```ts
 * import { interval } from 'rxjs';
 * import { repeat, take } from 'rxjs/operators';
 *
 * const source = interval(1000);
 * const example = source.pipe(take(3), repeat(2));
 * example.subscribe(x => console.log(x));
 *
 * // Results every second
 * // 0
 * // 1
 * // 2
 * // 0
 * // 1
 * // 2
 * ```
 *
 * @see {@link repeatWhen}
 * @see {@link retry}
 *
 * @param {number} [count] The number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 * @return A function that returns an Observable that will resubscribe to the
 * source stream when the source stream completes, at most `count` times.
 */
export function repeat<T>(count = Infinity): MonoTypeOperatorFunction<T> {
  return count <= 0
    ? () => EMPTY
    : operate((source, subscriber) => {
        let soFar = 0;
        let innerSub: Subscription | null;
        const subscribeForRepeat = () => {
          let syncUnsub = false;
          innerSub = source.subscribe(
            new OperatorSubscriber(subscriber, undefined, () => {
              if (++soFar < count) {
                if (innerSub) {
                  innerSub.unsubscribe();
                  innerSub = null;
                  subscribeForRepeat();
                } else {
                  syncUnsub = true;
                }
              } else {
                subscriber.complete();
              }
            })
          );

          if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            subscribeForRepeat();
          }
        };
        subscribeForRepeat();
      });
}
