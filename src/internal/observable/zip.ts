/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput, ObservedValueOf } from '../types';
import { innerFrom } from './from';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { EMPTY } from './empty';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { popResultSelector } from '../util/args';

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
  const resultSelector = popResultSelector(sources);

  sources = argsOrArgArray(sources);

  return sources.length
    ? new Observable<ObservedValueOf<O>[]>((subscriber) => {
        // A collection of buffers of values from each source.
        // Keyed by the same index with which the sources were passed in.
        let buffers: ObservedValueOf<O>[][] = sources.map(() => []);

        // An array of flags of whether or not the sources have completed.
        // This is used to check to see if we should complete the result.
        // Keyed by the same index with which the sources were passed in.
        let completed = sources.map(() => false);

        // When everything is done, release the arrays above.
        subscriber.add(() => {
          buffers = completed = null!;
        });

        // Loop over our sources and subscribe to each one. The index `i` is
        // especially important here, because we use it in closures below to
        // access the related buffers and completion properties
        for (let sourceIndex = 0; !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
          innerFrom(sources[sourceIndex]).subscribe(
            new OperatorSubscriber(
              subscriber,
              (value) => {
                buffers[sourceIndex].push(value);
                // if every buffer has at least one value in it, then we
                // can shift out the oldest value from each buffer and emit
                // them as an array.
                if (buffers.every((buffer) => buffer.length)) {
                  const result: any = buffers.map((buffer) => buffer.shift()!);
                  // Emit the array. If theres' a result selector, use that.
                  subscriber.next(resultSelector ? resultSelector(...result) : result);
                  // If any one of the sources is both complete and has an empty buffer
                  // then we complete the result. This is because we cannot possibly have
                  // any more values to zip together.
                  if (buffers.some((buffer, i) => !buffer.length && completed[i])) {
                    subscriber.complete();
                  }
                }
              },
              // Any error is passed through the result.
              undefined,
              () => {
                // This source completed. Mark it as complete so we can check it later
                // if we have to.
                completed[sourceIndex] = true;
                // But, if this complete source has nothing in its buffer, then we
                // can complete the result, because we can't possibly have any more
                // values from this to zip together with the oterh values.
                !buffers[sourceIndex].length && subscriber.complete();
              }
            )
          );
        }

        // When everything is done, release the arrays above.
        return () => {
          buffers = completed = null!;
        };
      })
    : EMPTY;
}
