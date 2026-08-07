import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const observeOn: unique symbol = Symbol('observeOn');

declare global {
  interface Observable<T> {
    [observeOn](delay?: number): Observable<T>;
  }
}

Observable.prototype[observeOn] = function <T>(this: Observable<T>, delay = 0): Observable<T> {
  return this[create]((subscriber) => {
    const timers = new Set<ReturnType<typeof globalThis.setTimeout>>();

    const schedule = (work: () => void): void => {
      if (delay === Infinity) {
        return;
      }
      const id = globalThis.setTimeout(() => {
        timers.delete(id);
        if (subscriber.active) {
          work();
        }
      }, delay);
      timers.add(id);
    };

    subscriber.addTeardown(() => {
      for (const id of timers) {
        globalThis.clearTimeout(id);
      }
      timers.clear();
    });

    subscribeToSource(this, subscriber, {
      next: (value) => schedule(() => subscriber.next(value)),
      error: (error) => schedule(() => subscriber.error(error)),
      complete: () => schedule(() => subscriber.complete()),
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `observeOn` form of the exact-Symbol `[observeOn]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[observeOn]` to its source.
 */
export function pipeableObserveOn<T>(delay?: number): (source: Observable<T>) => Observable<T>;
export function pipeableObserveOn(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[observeOn] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
