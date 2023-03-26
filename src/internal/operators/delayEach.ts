import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { concatMap } from '../operators/concatMap';
import { delay } from '../operators/delay';
import { of } from '../observable/of';

/**
 * Delays the emission of each item from the source Observable by a given time duration.
 *
 * <span class="informal">It's similar to {@link delay}, but delays each item individually by a fixed time duration.</span>
 *
 * ![](delayEach.png)
 *
 * `delayEach` operator shifts the emission of each value from the source Observable by a fixed time duration.
 * The source value is emitted on the output Observable after the specified time duration has passed.
 *
 * This operator internally leverages the {@link concatMap} and {@link delay} operators to achieve the desired behavior.
 *
 * ## Example
 *
 * Delay each click by 3 seconds
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { delayEach } from './your-custom-operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(
 *   delayEach(3000)
 * );
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link delay}
 * @see {@link delayWhen}
 * @see {@link concatMap}
 *
 * @param duration The time duration in milliseconds by which each item's emission should be delayed.
 * @return A function that returns an Observable that delays the emissions of the source Observable by the specified duration for each item.
 */
export function delayEach<T>(duration: number): MonoTypeOperatorFunction<T> {
  return concatMap((value) => of(value).pipe(delay(duration)));
}
