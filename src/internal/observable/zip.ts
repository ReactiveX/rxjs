/** @prettier */
import { Observable } from '../Observable';
import { ObservableInputTuple, ObservedValueOf } from '../types';
import { innerFrom } from './from';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { EMPTY } from './empty';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { popResultSelector } from '../util/args';
import { of } from './of';

// zip([a, b, c])
export function zip<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<A extends readonly unknown[], R>(
  sources: [...ObservableInputTuple<A>],
  resultSelector: (...values: A) => R
): Observable<R>;

// zip(a, b, c)
/** @deprecated Use the version that takes an empty array of Observables instead */
export function zip(): Observable<never>;
/** @deprecated Use the version that takes an array of Observables instead */
export function zip<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export function zip<A extends readonly unknown[], R>(
  ...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]
): Observable<R>;

// zip({a, b, c})
export function zip<T>(sourcesObject: T): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

/**
 * Combines multiple Observables to create an Observable whose values are calculated from the values, in order, of each
 * of its input Observables.
 *
 * If the last parameter is a function, this function is used to compute the created value from the input values.
 * Otherwise, an array of the input values is returned.
 *
 * ## Example
 *
 * Combine age and name from different sources (array)
 *
 * ```ts
 * import { zip, of } from 'rxjs';
 * import { map } from 'rxjs/operators';
 *
 * let age$ = of(27, 25, 29);
 * let name$ = of('Foo', 'Bar', 'Beer');
 * let isDev$ = of(true, true, false);
 *
 * zip([age$, name$, isDev$])
 * .subscribe(x => console.log(x));
 *
 * // Outputs
 * // [ 27, 'Foo', true ]
 * // [ 25, 'Bar', true ]
 * // [ 29, 'Beer', false ]
 * ```
 *
 * Combine age and name from different sources (object)
 *
 * ```ts
 * import { zip, of } from 'rxjs';
 * import { map } from 'rxjs/operators';
 *
 * let age$ = of(27, 25, 29);
 * let name$ = of('Foo', 'Bar', 'Beer');
 * let isDev$ = of(true, true, false);
 *
 * zip({ age: age$, name: name$, isDev: isDev$)
 * .subscribe(x => console.log(x));
 *
 * // Outputs
 * // { age: 27, name: 'Foo', isDev: true }
 * // { age: 25, name: 'Bar', isDev: true }
 * // { age: 29, name: 'Beer', isDev: false }
 * ```

 * @param sources
 * @return {Observable<R>}
 */
export function zip(...args: unknown[]): Observable<unknown> {
  const resultSelector = popResultSelector(args);

  const { args: sources, keys } = argsArgArrayOrObject(args);

  if (args === sources && args.length === 0) {
    // deprecated path: empty zip()
    return EMPTY;
  }

  if (sources.length === 0) {
    return of(keys ? {} : []);
  }

  return new Observable<unknown[]>((subscriber) => {
    // A collection of buffers of values from each source.
    // Keyed by the same index with which the sources were passed in.
    let buffers: unknown[][] = sources.map(() => []);

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
      innerFrom(sources[sourceIndex] as Observable<unknown>).subscribe(
        new OperatorSubscriber(
          subscriber,
          (value) => {
            buffers[sourceIndex].push(value);
            // if every buffer has at least one value in it, then we
            // can shift out the oldest value from each buffer and emit
            // them as an array.
            if (buffers.every((buffer) => buffer.length)) {
              const values: any = buffers.map((buffer) => buffer.shift()!);
              //
              // Emit the array. If theres' a result selector, use that.
              if (resultSelector) {
                // deprecated path with a result selector
                subscriber.next(resultSelector(...values) as unknown[]);
              } else {
                subscriber.next(keys ? keys.reduce((result, key, i) => (((result as any)[key] = values[i]), result), {}) : values);
              }

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
            // values from this to zip together with the other values.
            !buffers[sourceIndex].length && subscriber.complete();
          }
        )
      );
    }

    // When everything is done, release the arrays above.
    return () => {
      buffers = completed = null!;
    };
  });
}
