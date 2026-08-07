import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const takeLast: unique symbol = Symbol('takeLast');

declare global {
  interface Observable<T> {
    [takeLast]: (amount?: number) => Observable<T>;
  }
}

Observable.prototype[takeLast] = function <T>(this: Observable<T>, amount = 1): Observable<T> {
  return this[create]((subscriber) => {
    if (amount <= 0) {
      subscriber.complete();
      return;
    }

    let ring = new Array<T>(amount);
    let counter = 0;
    subscriber.addTeardown(() => {
      ring = null!;
    });
    subscribeToSource(this, subscriber, {
      next: (value) => {
        ring[counter++ % amount] = value;
      },
      complete: () => {
        const start = amount <= counter ? counter : 0;
        const total = Math.min(amount, counter);
        for (let i = 0; i < total; i++) {
          subscriber.next(ring[(start + i) % amount]!);
        }
        subscriber.complete();
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `takeLast` form of the exact-Symbol `[takeLast]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[takeLast]` to its source.
 */
export function pipeableTakeLast<T>(amount?: number): (source: Observable<T>) => Observable<T>;
export function pipeableTakeLast(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[takeLast] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
