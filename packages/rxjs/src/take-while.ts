import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const takeWhile: unique symbol = Symbol('takeWhile');

declare global {
  interface Observable<T> {
    [takeWhile]: {
      <R extends T>(predicate: (value: T, index: number) => value is R, config?: { includeLast?: boolean }): Observable<R>;
      (predicate: (value: T, index: number) => boolean, config?: { includeLast?: boolean }): Observable<T>;
    };
  }
}

Observable.prototype[takeWhile] = function <T>(
  this: Observable<T>,
  predicate: (value: T, index: number) => boolean,
  config?: { includeLast?: boolean }
): Observable<T> {
  return this[create]((subscriber) => {
    const { includeLast = false } = config ?? {};
    let index = 0;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (predicate(value, index++)) {
          subscriber.next(value);
        } else {
          if (includeLast) {
            subscriber.next(value);
          }
          subscriber.complete();
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `takeWhile` form of the exact-Symbol `[takeWhile]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[takeWhile]` to its source.
 */
export function pipeableTakeWhile<T, R extends T>(predicate: (value: T, index: number) => value is R, config?: { includeLast?: boolean }): (source: Observable<T>) => Observable<R>;
export function pipeableTakeWhile<T>(predicate: (value: T, index: number) => boolean, config?: { includeLast?: boolean }): (source: Observable<T>) => Observable<T>;
export function pipeableTakeWhile(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[takeWhile] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
