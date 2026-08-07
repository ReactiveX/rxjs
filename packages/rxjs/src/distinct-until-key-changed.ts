import { distinctUntilChanged } from './distinct-until-changed.js';

type Comparator<T> = (previous: T, current: T) => boolean;

export const distinctUntilKeyChanged: unique symbol = Symbol('distinctUntilKeyChanged');

declare global {
  interface Observable<T> {
    [distinctUntilKeyChanged]: <K extends keyof T>(key: K, comparator?: Comparator<T[K]>) => Observable<T>;
  }
}

Observable.prototype[distinctUntilKeyChanged] = function <T, K extends keyof T>(
  this: Observable<T>,
  key: K,
  comparator?: Comparator<T[K]>
): Observable<T> {
  return this[distinctUntilChanged](comparator, (value) => value[key]);
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `distinctUntilKeyChanged` form of the exact-Symbol `[distinctUntilKeyChanged]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[distinctUntilKeyChanged]` to its source.
 */
export function pipeableDistinctUntilKeyChanged<T, K extends keyof T>(key: K, comparator?: Comparator<T[K]>): (source: Observable<T>) => Observable<T>;
export function pipeableDistinctUntilKeyChanged(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[distinctUntilKeyChanged] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
