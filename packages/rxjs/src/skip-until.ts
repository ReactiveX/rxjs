import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skipUntil: unique symbol = Symbol('skipUntil');

declare global {
  interface Observable<T> {
    [skipUntil]: (notifier: ObservableInput<any>) => Observable<T>;
  }
}

Observable.prototype[skipUntil] = function <T>(this: Observable<T>, notifier: ObservableInput<any>): Observable<T> {
  return this[create]((subscriber) => {
    let taking = false;
    const notifierController = new AbortController();
    subscriber.addTeardown(() => notifierController.abort(subscriber.signal.reason));

    let notifierSource: Observable<any>;
    try {
      notifierSource = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(
      notifierSource,
      subscriber,
      {
        next: () => {
          notifierController.abort();
          taking = true;
        },
        complete: () => void 0,
      },
      notifierController.signal
    );

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (taking) {
          subscriber.next(value);
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `skipUntil` form of the exact-Symbol `[skipUntil]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[skipUntil]` to its source.
 */
export function pipeableSkipUntil<T>(notifier: ObservableInput<any>): (source: Observable<T>) => Observable<T>;
export function pipeableSkipUntil(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[skipUntil] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
