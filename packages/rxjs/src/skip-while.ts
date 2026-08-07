import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skipWhile: unique symbol = Symbol('skipWhile');

declare global {
  interface Observable<T> {
    [skipWhile]: {
      <R extends T>(predicate: (value: T, index: number) => value is R): Observable<Exclude<T, R>>;
      (predicate: (value: T, index: number) => boolean): Observable<T>;
    };
  }
}

Observable.prototype[skipWhile] = function <T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;
    let skipping = true;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (skipping) {
          skipping = predicate(value, index++);
        }

        if (!skipping) {
          subscriber.next(value);
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `skipWhile` form of the exact-Symbol `[skipWhile]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[skipWhile]` to its source.
 */
export function pipeableSkipWhile<T, R extends T>(predicate: (value: T, index: number) => value is R): (source: Observable<T>) => Observable<Exclude<T, R>>;
export function pipeableSkipWhile<T>(predicate: (value: T, index: number) => boolean): (source: Observable<T>) => Observable<T>;
export function pipeableSkipWhile(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[skipWhile] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
