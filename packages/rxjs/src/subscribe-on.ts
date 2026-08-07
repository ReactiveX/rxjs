import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const subscribeOn: unique symbol = Symbol('subscribeOn');

declare global {
  interface Observable<T> {
    [subscribeOn](delay?: number): Observable<T>;
  }
}

Observable.prototype[subscribeOn] = function <T>(this: Observable<T>, delay = 0): Observable<T> {
  return this[create]((subscriber) => {
    if (delay === Infinity) {
      return;
    }

    const id = globalThis.setTimeout(() => {
      if (subscriber.active) {
        subscribeToSource(this, subscriber);
      }
    }, delay);
    subscriber.addTeardown(() => globalThis.clearTimeout(id));
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `subscribeOn` form of the exact-Symbol `[subscribeOn]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[subscribeOn]` to its source.
 */
export function pipeableSubscribeOn<T>(delay?: number): (source: Observable<T>) => Observable<T>;
export function pipeableSubscribeOn(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[subscribeOn] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
