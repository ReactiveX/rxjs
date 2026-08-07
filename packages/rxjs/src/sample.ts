import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const sample: unique symbol = Symbol('sample');

declare global {
  interface Observable<T> {
    [sample](notifier: ObservableInput<unknown>): Observable<T>;
  }
}

Observable.prototype[sample] = function <T>(this: Observable<T>, notifier: ObservableInput<unknown>): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;
    let latestValue: T | undefined;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        latestValue = value;
      },
    });

    if (subscriber.signal.aborted) {
      return;
    }

    let notifications: Observable<unknown>;
    try {
      notifications = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(notifications, subscriber, {
      next: () => {
        if (hasValue) {
          hasValue = false;
          const value = latestValue as T;
          latestValue = undefined;
          subscriber.next(value);
        }
      },
      complete: () => void 0,
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `sample` form of the exact-Symbol `[sample]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[sample]` to its source.
 */
export function pipeableSample<T>(notifier: ObservableInput<unknown>): (source: Observable<T>) => Observable<T>;
export function pipeableSample(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[sample] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
