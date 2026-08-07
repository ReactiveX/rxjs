import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skipLast: unique symbol = Symbol('skipLast');

declare global {
  interface Observable<T> {
    [skipLast]: (amount?: number) => Observable<T>;
  }
}

Observable.prototype[skipLast] = function <T>(this: Observable<T>, amount = 1): Observable<T> {
  if (amount <= 0) {
    return this;
  }

  return this[create]((subscriber) => {
    let ring = new Array<T>(amount);
    let seen = 0;
    subscriber.addTeardown(() => {
      ring = null!;
    });

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const valueIndex = seen++;
        if (valueIndex < amount) {
          ring[valueIndex] = value;
        } else {
          const index = valueIndex % amount;
          const oldValue = ring[index]!;
          ring[index] = value;
          subscriber.next(oldValue);
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `skipLast` form of the exact-Symbol `[skipLast]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[skipLast]` to its source.
 */
export function pipeableSkipLast<T>(amount?: number): (source: Observable<T>) => Observable<T>;
export function pipeableSkipLast(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[skipLast] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
