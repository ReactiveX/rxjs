import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const startWith: unique symbol = Symbol('startWith');

declare global {
  interface Observable<T> {
    [startWith]<A extends readonly unknown[]>(...values: A): Observable<T | A[number]>;
  }
}

Observable.prototype[startWith] = function <T, A extends readonly unknown[]>(this: Observable<T>, ...values: A): Observable<T | A[number]> {
  return this[create]((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        return;
      }
      subscriber.next(value);
    }

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber);
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `startWith` form of the exact-Symbol `[startWith]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[startWith]` to its source.
 */
export function pipeableStartWith<T, A extends readonly unknown[]>(...values: A): (source: Observable<T>) => Observable<T | A[number]>;
export function pipeableStartWith(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[startWith] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
