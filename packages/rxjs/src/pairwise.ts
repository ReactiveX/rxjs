import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const pairwise: unique symbol = Symbol('pairwise');

declare global {
  interface Observable<T> {
    [pairwise]: () => Observable<[T, T]>;
  }
}

Observable.prototype[pairwise] = function <T>(this: Observable<T>): Observable<[T, T]> {
  return this[create]((subscriber) => {
    let previous: T;
    let hasPrevious = false;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const pair: [T, T] | undefined = hasPrevious ? [previous, value] : undefined;
        previous = value;
        hasPrevious = true;

        if (pair) {
          subscriber.next(pair);
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `pairwise` form of the exact-Symbol `[pairwise]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[pairwise]` to its source.
 */
export function pipeablePairwise<T>(): (source: Observable<T>) => Observable<[T, T]>;
export function pipeablePairwise(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[pairwise] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
