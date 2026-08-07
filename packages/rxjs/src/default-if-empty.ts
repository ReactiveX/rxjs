import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const defaultIfEmpty: unique symbol = Symbol('defaultIfEmpty');

declare global {
  interface Observable<T> {
    [defaultIfEmpty]: <R>(defaultValue: R) => Observable<T | R>;
  }
}

Observable.prototype[defaultIfEmpty] = function <T, R>(this: Observable<T>, defaultValue: R): Observable<T | R> {
  return this[create]((subscriber) => {
    let hasValue = false;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        subscriber.next(value);
      },
      complete: () => {
        if (!hasValue) {
          subscriber.next(defaultValue);
        }
        subscriber.complete();
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `defaultIfEmpty` form of the exact-Symbol `[defaultIfEmpty]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[defaultIfEmpty]` to its source.
 */
export function pipeableDefaultIfEmpty<T, R>(defaultValue: R): (source: Observable<T>) => Observable<T | R>;
export function pipeableDefaultIfEmpty(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[defaultIfEmpty] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
