import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const takeUntil: unique symbol = Symbol('takeUntil');

declare global {
  interface Observable<T> {
    [takeUntil](notifier: ObservableInput<any>): Observable<T>;
  }
}

Observable.prototype[takeUntil] = function <T>(this: Observable<T>, notifier: ObservableInput<any>): Observable<T> {
  return this[create]((subscriber) => {
    let notifierSource: Observable<any>;
    try {
      notifierSource = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(notifierSource, subscriber, { next: () => subscriber.complete(), complete: () => void 0 });

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber);
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `takeUntil` form of the exact-Symbol `[takeUntil]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[takeUntil]` to its source.
 */
export function pipeableTakeUntil<T>(notifier: ObservableInput<any>): (source: Observable<T>) => Observable<T>;
export function pipeableTakeUntil(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[takeUntil] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
