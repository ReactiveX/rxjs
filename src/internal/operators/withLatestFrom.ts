import { OperatorFunction, ObservableInput, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/sources/fromSource';
import { identity } from 'rxjs/internal/util/identity';

/* tslint:disable:max-line-length */
export function withLatestFrom<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
export function withLatestFrom<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R> ;
export function withLatestFrom<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
export function withLatestFrom<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
export function withLatestFrom<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
export function withLatestFrom<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
export function withLatestFrom<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]> ;
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
 * ```javascript
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
 * @method withLatestFrom
 * @owner Observable
 */
export function withLatestFrom<T, R>(...args: Array<ObservableInput<any>>): OperatorFunction<T, R> {
  const otherSources: Array<ObservableInput<any>> = (args && args.length === 1 && Array.isArray(args[0]))
    ? args[0] as Array<ObservableInput<any>>
    : args;

  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    const others = tryUserFunction(() => otherSources.map(fromSource));
    if (resultIsError(others)) {
      dest(FOType.ERROR, others.error, subs);
      subs.unsubscribe();
      return;
    }
    let sources = [source, ...others];
    let cache = sources.map(() => undefined);
    let hasValue = sources.map(() => false);
    let allHaveValues = false;

    for (let i = 0; i < sources.length && !subs.closed; i++) {
      const src = sources[i];
      const innerSubs = new Subscription();
      subs.add(innerSubs);
      src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, innerSubs: Subscription) => {
        if (t === FOType.NEXT) {
          if (!allHaveValues) {
            hasValue[i] = true;
            allHaveValues = hasValue.every(identity);
          }
          cache[i] = v;
          if (allHaveValues && i === 0) {
            dest(t, cache.slice(), subs);
          }
        } else if (t === FOType.ERROR || i === 0) {
          dest(t, v, subs);
          subs.unsubscribe();
        }
      }, innerSubs);
    }
  });
}
