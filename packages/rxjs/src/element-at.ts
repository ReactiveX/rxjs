import { create } from './create.js';
import { ArgumentOutOfRangeError } from './argument-out-of-range-error.js';
import '@rxjs/observable-polyfill';
import { subscribeToSource } from './util/observable-helpers.js';

export const elementAt: unique symbol = Symbol('elementAt');

declare global {
  interface Observable<T> {
    [elementAt](index: number): Observable<T>;
    [elementAt]<D>(index: number, defaultValue: D): Observable<T | D>;
  }
}

Observable.prototype[elementAt] = function <T, D>(this: Observable<T>, index: number, ...defaultValue: [] | [D]): Observable<T | D> {
  if (index < 0) {
    throw new ArgumentOutOfRangeError();
  }

  const hasDefault = defaultValue.length === 1;
  return this[create]((subscriber) => {
    let count = 0;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (count === index) {
          subscriber.next(value);
          subscriber.complete();
          return;
        }
        count++;
      },
      complete: () => {
        if (hasDefault) {
          subscriber.next(defaultValue[0]);
          subscriber.complete();
        } else {
          subscriber.error(new ArgumentOutOfRangeError());
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `elementAt` form of the exact-Symbol `[elementAt]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[elementAt]` to its source.
 */
export function pipeableElementAt<T>(index: number): (source: Observable<T>) => Observable<T>;
export function pipeableElementAt(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[elementAt] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
