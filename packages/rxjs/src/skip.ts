import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skip: unique symbol = Symbol('skip');

declare global {
  interface Observable<T> {
    [skip]: (count: number) => Observable<T>;
  }
}

Observable.prototype[skip] = function <T>(this: Observable<T>, count: number): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (count <= index++) {
          subscriber.next(value);
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `skip` form of the exact-Symbol `[skip]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[skip]` to its source.
 */
export function pipeableSkip<T>(count: number): (source: Observable<T>) => Observable<T>;
export function pipeableSkip(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[skip] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
