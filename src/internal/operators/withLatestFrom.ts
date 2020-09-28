/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/from';
import { identity } from '../util/identity';
import { noop } from '../util/noop';
import { popResultSelector } from '../util/args';

/* tslint:disable:max-line-length */
export function withLatestFrom<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, O2 extends ObservableInput<any>, R>(
  source2: O2,
  project: (v1: T, v2: ObservedValueOf<O2>) => R
): OperatorFunction<T, R>;
export function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(
  v2: O2,
  v3: O3,
  project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R
): OperatorFunction<T, R>;
export function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, R>(
  v2: O2,
  v3: O3,
  v4: O4,
  project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R
): OperatorFunction<T, R>;
export function withLatestFrom<
  T,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  R
>(
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>) => R
): OperatorFunction<T, R>;
export function withLatestFrom<
  T,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>,
  R
>(
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6,
  project: (
    v1: T,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>,
    v6: ObservedValueOf<O6>
  ) => R
): OperatorFunction<T, R>;
export function withLatestFrom<T, O2 extends ObservableInput<any>>(source2: O2): OperatorFunction<T, [T, ObservedValueOf<O2>]>;
export function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(
  v2: O2,
  v3: O3
): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(
  v2: O2,
  v3: O3,
  v4: O4
): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export function withLatestFrom<
  T,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>
>(
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5
): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export function withLatestFrom<
  T,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>
>(
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6
): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
export function withLatestFrom<T, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, R>;
export function withLatestFrom<T, R>(array: ObservableInput<any>[]): OperatorFunction<T, R>;
export function withLatestFrom<T, R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): OperatorFunction<T, R>;

/* tslint:enable:max-line-length */

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
 * On every click event, emit an array with the latest timer event plus the click event
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { withLatestFrom } from 'rxjs/operators';
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
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 * @name withLatestFrom
 */
export function withLatestFrom<T, R>(...inputs: any[]): OperatorFunction<T, R | any[]> {
  const project = popResultSelector(inputs) as ((...args: any[]) => R) | undefined;

  return operate((source, subscriber) => {
    const len = inputs.length;
    const otherValues = new Array(len);
    // An array of whether or not the other sources have emitted. Matched with them by index.
    // TODO: At somepoint, we should investigate the performance implications here, and look
    // into using a `Set()` and checking the `size` to see if we're ready.
    let hasValue = inputs.map(() => false);
    // Flipped true when we have at least one value from all other sources and
    // we are ready to start emitting values.
    let ready = false;

    // Source subscription
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        if (ready) {
          // We have at least one value from the other sources. Go ahead and emit.
          const values = [value, ...otherValues];
          subscriber.next(project ? project(...values) : values);
        }
      })
    );

    // Other sources
    for (let i = 0; i < len; i++) {
      const input = inputs[i];
      let otherSource: Observable<any>;
      try {
        otherSource = innerFrom(input);
      } catch (err) {
        subscriber.error(err);
        return;
      }
      otherSource.subscribe(
        new OperatorSubscriber(
          subscriber,
          (value) => {
            otherValues[i] = value;
            if (!ready && !hasValue[i]) {
              // If we're not ready yet, flag to show this observable has emitted.
              hasValue[i] = true;
              // Intentionally terse code.
              // If all of our other observables have emitted, set `ready` to `true`,
              // so we know we can start emitting values, then clean up the `hasValue` array,
              // because we don't need it anymore.
              (ready = hasValue.every(identity)) && (hasValue = null!);
            }
          },
          undefined,
          // Completing one of the other sources has
          // no bearing on the completion of our result.
          noop
        )
      );
    }
  });
}
