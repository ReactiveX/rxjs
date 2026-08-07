import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const retryWhen: unique symbol = Symbol('retryWhen');

declare global {
  interface Observable<T> {
    [retryWhen](notifier: (errors: Observable<any>) => ObservableInput<any>): Observable<T>;
  }
}

Observable.prototype[retryWhen] = function <T>(
  this: Observable<T>,
  notifier: (errors: Observable<any>) => ObservableInput<any>
): Observable<T> {
  const source = this;

  return source[create]((subscriber) => {
    let errors: Subject<any> | undefined;
    let pendingAttempts = 1;
    let draining = false;

    function requestAttempt(): void {
      if (!subscriber.active) {
        return;
      }

      pendingAttempts++;
      drainAttempts();
    }

    function startNotifier(): Subject<any> | undefined {
      const errorStream = new Subject<any>();
      const notifierSource = Observable.from(notifier(errorStream));
      subscribeToSource(notifierSource, subscriber, { next: requestAttempt });

      return subscriber.active ? errorStream : undefined;
    }

    function startAttempt(): void {
      const sourceController = new AbortController();
      let sourceTerminated = false;

      const handleSourceError = (error: any): void => {
        if (sourceTerminated) {
          return;
        }

        sourceTerminated = true;
        sourceController.abort();
        if (!subscriber.active) {
          return;
        }

        errors ??= startNotifier();
        errors?.next(error);
      };

      subscribeToSource(
        source,
        subscriber,
        {
          error: handleSourceError,
          complete: () => {
            if (!sourceTerminated) {
              sourceTerminated = true;
              subscriber.complete();
            }
          },
        },
        sourceController.signal
      );
    }

    function drainAttempts(): void {
      if (draining || !subscriber.active) {
        return;
      }

      draining = true;
      try {
        while (pendingAttempts > 0 && subscriber.active) {
          pendingAttempts--;
          startAttempt();
        }
      } finally {
        draining = false;
      }
    }

    drainAttempts();
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `retryWhen` form of the exact-Symbol `[retryWhen]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[retryWhen]` to its source.
 */
export function pipeableRetryWhen<T>(notifier: (errors: Observable<any>) => ObservableInput<any>): (source: Observable<T>) => Observable<T>;
export function pipeableRetryWhen(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[retryWhen] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
