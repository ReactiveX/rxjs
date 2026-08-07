import { reduce } from './reduce.js';

type Comparer<T> = (previous: T, current: T) => number;

export const max: unique symbol = Symbol('max');

declare global {
  interface Observable<T> {
    [max]: (comparer?: Comparer<T>) => Observable<T>;
  }
}

Observable.prototype[max] = function <T>(this: Observable<T>, comparer?: Comparer<T>): Observable<T> {
  const selectMaximum =
    typeof comparer === 'function'
      ? (previous: T, current: T) => (comparer(previous, current) > 0 ? previous : current)
      : (previous: T, current: T) => (previous > current ? previous : current);

  return this[reduce](selectMaximum);
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `max` form of the exact-Symbol `[max]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[max]` to its source.
 */
export function pipeableMax<T>(comparer?: Comparer<T>): (source: Observable<T>) => Observable<T>;
export function pipeableMax(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[max] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
