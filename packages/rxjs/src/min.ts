import { reduce } from './reduce.js';

export const min: unique symbol = Symbol('min');

declare global {
  interface Observable<T> {
    [min](comparer?: (previous: T, current: T) => number): Observable<T>;
  }
}

Observable.prototype[min] = function <T>(this: Observable<T>, comparer?: (previous: T, current: T) => number): Observable<T> {
  const selectMinimum =
    typeof comparer === 'function'
      ? (previous: T, current: T) => (comparer(previous, current) < 0 ? previous : current)
      : (previous: T, current: T) => (previous < current ? previous : current);

  return this[reduce](selectMinimum);
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `min` form of the exact-Symbol `[min]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[min]` to its source.
 */
export function pipeableMin<T>(comparer?: (previous: T, current: T) => number): (source: Observable<T>) => Observable<T>;
export function pipeableMin(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[min] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
