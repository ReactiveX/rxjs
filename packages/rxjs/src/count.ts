import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const count: unique symbol = Symbol('count');

declare global {
  interface Observable<T> {
    [count]: (predicate?: (value: T, index: number) => boolean) => Observable<number>;
  }
}

Observable.prototype[count] = function <T>(this: Observable<T>, predicate?: (value: T, index: number) => boolean): Observable<number> {
  return this[create]((subscriber) => {
    let total = 0;
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (!predicate) {
          total++;
          return;
        }

        if (predicate(value, index++)) {
          total++;
        }
      },
      complete: () => {
        subscriber.next(total);
        subscriber.complete();
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `count` form of the exact-Symbol `[count]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[count]` to its source.
 */
export function pipeableCount<T>(predicate?: (value: T, index: number) => boolean): (source: Observable<T>) => Observable<number>;
export function pipeableCount(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[count] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
