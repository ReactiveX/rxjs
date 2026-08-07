import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const distinct: unique symbol = Symbol('distinct');

declare global {
  interface Observable<T> {
    [distinct]: <K = T>(keySelector?: (value: T) => K, flushes?: ObservableInput<any>) => Observable<T>;
  }
}

Observable.prototype[distinct] = function <T, K = T>(
  this: Observable<T>,
  keySelector?: (value: T) => K,
  flushes?: ObservableInput<any>
): Observable<T> {
  return this[create]((subscriber) => {
    const keys = new Set<K | T>();

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const key = keySelector ? keySelector(value) : value;
        if (!keys.has(key)) {
          keys.add(key);
          subscriber.next(value);
        }
      },
    });

    if (!subscriber.active || !flushes) {
      return;
    }

    let flushSource: Observable<any>;
    try {
      flushSource = Observable.from(flushes);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(flushSource, subscriber, { next: () => keys.clear(), complete: () => void 0 });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `distinct` form of the exact-Symbol `[distinct]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[distinct]` to its source.
 */
export function pipeableDistinct<T, K = T>(keySelector?: (value: T) => K, flushes?: ObservableInput<any>): (source: Observable<T>) => Observable<T>;
export function pipeableDistinct(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[distinct] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
