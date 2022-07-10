import { OperatorFunction, ObservableInputTuple } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';
import { noop } from '../util/noop';
import { popResultSelector } from '../util/args';

export function withLatestFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]>;

export function withLatestFrom<T, O extends unknown[], R>(
  ...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]
): OperatorFunction<T, R>;

/**
 * Combines the source Observable with other Observables to create an Observable
 * whose values are calculated from the latest values of each, only when the
 * source emits.
 *
 * <span class="informal">Whenever the source Observable emits a value, it
 * computes a formula using that value plus the latest values from other input
 * Observables, then emits the output of that formula.</span>
 *
 * ![](withLatestFrom.png)
 *
 * `withLatestFrom` combines each value from the source Observable (the
 * instance) with the latest values from the other input Observables only when
 * the source emits a value, optionally using a `project` function to determine
 * the value to be emitted on the output Observable. All input Observables must
 * emit at least one value before the output Observable will emit a value.
 *
 * ## Example
 *
 * On every click event, emit an array with the latest timer event plus the click event
 *
 * ```ts
 * import { fromEvent, interval, withLatestFrom } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const result = clicks.pipe(withLatestFrom(timer));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link combineLatest}
 *
 * @param {ObservableInput} other An input Observable to combine with the source
 * Observable. More than one input Observables may be given as argument.
 * @param {Function} [project] Projection function for combining values
 * together. Receives all values in order of the Observables passed, where the
 * first parameter is a value from the source Observable. (e.g.
 * `a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))`). If this is not
 * passed, arrays will be emitted on the output Observable.
 * @return A function that returns an Observable of projected values from the
 * most recent values from each input Observable, or an array of the most
 * recent values from each input Observable.
 */
export function withLatestFrom<T, R>(...inputs: any[]): OperatorFunction<T, R | any[]> {
  const project = popResultSelector(inputs) as ((...args: any[]) => R) | undefined;

  return operate((source, subscriber) => {
    const len = inputs.length;
    const otherValues = new Array(len);
    let remainingValues = len;
    // Flipped true when we have at least one value from all other sources and
    // we are ready to start emitting values.
    let ready = false;

    // Other sources. Note that here we are not checking `subscriber.closed`,
    // this causes all inputs to be subscribed to, even if nothing can be emitted
    // from them. This is an important distinction because subscription constitutes
    // a side-effect.
    for (let i = 0; i < len; i++) {
      let hasFirstValue = false;
      innerFrom(inputs[i]).subscribe(
        createOperatorSubscriber(
          subscriber,
          (value) => {
            otherValues[i] = value;
            if (!ready && !hasFirstValue && remainingValues) {
              // If we're not ready yet, subtract one value from remainingValues and mark
              // this inner observable because he emitted a value.
              remainingValues--;
              hasFirstValue = true;
              // Intentionally terse code.
              // If all of our other observables have emitted, set `ready` to `true`,
              // so we know we can start emitting values.
              ready = remainingValues === 0;
            }
          },
          // Completing one of the other sources has
          // no bearing on the completion of our result.
          noop
        )
      );
    }

    // Source subscription
    source.subscribe(
      createOperatorSubscriber(subscriber, (value) => {
        if (ready) {
          // We have at least one value from the other sources. Go ahead and emit.
          const values = [value, ...otherValues];
          subscriber.next(project ? project(...values) : values);
        }
      })
    );
  });
}
