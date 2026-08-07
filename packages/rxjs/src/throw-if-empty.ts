import { create } from './create.js';
import { EmptyError } from './empty-error.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const throwIfEmpty: unique symbol = Symbol('throwIfEmpty');

declare global {
  interface Observable<T> {
    [throwIfEmpty](errorFactory?: () => unknown): Observable<T>;
  }
}

Observable.prototype[throwIfEmpty] = function <T>(
  this: Observable<T>,
  errorFactory: () => unknown = () => new EmptyError()
): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        subscriber.next(value);
      },
      complete: () => {
        if (hasValue) {
          subscriber.complete();
          return;
        }

        subscriber.error(errorFactory());
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `throwIfEmpty` form of the exact-Symbol `[throwIfEmpty]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[throwIfEmpty]` to its source.
 */
export function pipeableThrowIfEmpty<T>(errorFactory?: () => unknown): (source: Observable<T>) => Observable<T>;
export function pipeableThrowIfEmpty(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[throwIfEmpty] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
