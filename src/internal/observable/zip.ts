/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput, ObservedValueOf } from '../types';
import { Subscription } from '../Subscription';
import { from } from './from';

/* tslint:disable:max-line-length */
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<O1 extends ObservableInput<any>, R>(v1: O1, resultSelector: (v1: ObservedValueOf<O1>) => R): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(
  v1: O1,
  v2: O2,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R
): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(
  v1: O1,
  v2: O2,
  v3: O3,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R
): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R
): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>
  ) => R
): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6,
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>,
    v6: ObservedValueOf<O6>
  ) => R
): Observable<R>;

export function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(
  v1: O1,
  v2: O2
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(
  v1: O1,
  v2: O2,
  v3: O3
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>
>(v1: O1, v2: O2, v3: O3, v4: O4): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export function zip<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6
): Observable<
  [ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]
>;

export function zip<O extends ObservableInput<any>>(array: O[]): Observable<ObservedValueOf<O>[]>;
export function zip<R>(array: ObservableInput<any>[]): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<O extends ObservableInput<any>, R>(array: O[], resultSelector: (...values: ObservedValueOf<O>[]) => R): Observable<R>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<R>(array: ObservableInput<any>[], resultSelector: (...values: any[]) => R): Observable<R>;

export function zip<O extends ObservableInput<any>>(...observables: O[]): Observable<ObservedValueOf<O>[]>;
export function zip<O extends ObservableInput<any>, R>(...observables: Array<O | ((...values: ObservedValueOf<O>[]) => R)>): Observable<R>;
export function zip<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * Combines multiple Observables to create an Observable whose values are calculated from the values, in order, of each
 * of its input Observables.
 *
 * If the last parameter is a function, this function is used to compute the created value from the input values.
 * Otherwise, an array of the input values is returned.
 *
 * ## Example
 *
 * Combine age and name from different sources
 *
 * ```ts
 * import { zip, of } from 'rxjs';
 * import { map } from 'rxjs/operators';
 *
 * let age$ = of(27, 25, 29);
 * let name$ = of('Foo', 'Bar', 'Beer');
 * let isDev$ = of(true, true, false);
 *
 * zip(age$, name$, isDev$).pipe(
 *   map(([age, name, isDev]) => ({ age, name, isDev }))
 * )
 * .subscribe(x => console.log(x));
 *
 * // Outputs
 * // { age: 27, name: 'Foo', isDev: true }
 * // { age: 25, name: 'Bar', isDev: true }
 * // { age: 29, name: 'Beer', isDev: false }
 * ```
 * @param sources
 * @return {Observable<R>}
 * @static true
 * @name zip
 * @owner Observable
 */
export function zip<O extends ObservableInput<any>, R>(
  ...sources: Array<O | ((...values: ObservedValueOf<O>[]) => R)>
): Observable<ObservedValueOf<O>[] | R> {
  let resultSelector: ((...ys: Array<any>) => R) | undefined = undefined;
  if (typeof sources[sources.length - 1] === 'function') {
    resultSelector = sources.pop() as typeof resultSelector;
  }

  return new Observable<ObservedValueOf<O>[]>((subscriber) => {
    const buffers: ObservedValueOf<O>[][] = sources.map(() => []);
    const completed = sources.map(() => false);
    const subscription = new Subscription();

    const tryEmit = () => {
      if (buffers.every((buffer) => buffer.length > 0)) {
        let result: any = buffers.map((buffer) => buffer.shift()!);
        if (resultSelector) {
          try {
            result = resultSelector(...result);
          } catch (err) {
            subscriber.error(err);
            return;
          }
        }
        subscriber.next(result);
        if (buffers.some((buffer, i) => buffer.length === 0 && completed[i])) {
          subscriber.complete();
        }
      }
    };

    for (let i = 0; !subscriber.closed && i < sources.length; i++) {
      const source = from(sources[i]);
      subscription.add(
        source.subscribe({
          next: (value) => {
            buffers[i].push(value);
            tryEmit();
          },
          error: (err) => subscriber.error(err),
          complete: () => {
            completed[i] = true;
            if (buffers[i].length === 0) {
              subscriber.complete();
            }
          },
        })
      );
    }
    return subscription;
  });
}
