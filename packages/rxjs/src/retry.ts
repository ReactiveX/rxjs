import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';
import '@rxjs/observable-polyfill';

export const retry: unique symbol = Symbol('retry');

declare global {
  interface Observable<T> {
    [retry](config?: {
      count?: number;
      delay?: number | ((error: any, retryCount: number) => ObservableInput<any>);
      resetOnSuccess?: boolean;
    }): Observable<T>;
  }
}

Observable.prototype[retry] = function <T>(
  this: Observable<T>,
  config?: {
    count?: number;
    delay?: null | number | ((error: any, retryCount: number) => ObservableInput<any>);
    resetOnSuccess?: boolean;
  }
) {
  const { count = Infinity, delay = null, resetOnSuccess = true } = config ?? {};

  return this[create]((subscriber) => {
    let retriesRemaining = count;
    let retryCount = 0;

    const innerSub = () => {
      if (!subscriber.active) {
        return;
      }

      const sourceController = new AbortController();

      subscribeToSource(
        this,
        subscriber,
        {
          next: (value) => {
            if (resetOnSuccess) {
              retriesRemaining = count;
              retryCount = 0;
            }
            subscriber.next(value);
          },
          error: (error) => {
            sourceController.abort();

            if (retriesRemaining > 0) {
              retriesRemaining--;
              retryCount++;
              if (delay !== null) {
                if (typeof delay === 'number') {
                  const id = globalThis.setTimeout(innerSub, delay);
                  subscriber.addTeardown(() => globalThis.clearTimeout(id));
                } else {
                  const result = Observable.from(delay(error, retryCount));

                  const notifierController = new AbortController();
                  subscribeToSource(
                    result,
                    subscriber,
                    {
                      next: () => {
                        notifierController.abort();
                        innerSub();
                      },
                    },
                    notifierController.signal
                  );
                }
              } else {
                innerSub();
              }
            } else {
              subscriber.error(error);
            }
          },
        },
        sourceController.signal
      );
    };

    innerSub();
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `retry` form of the exact-Symbol `[retry]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[retry]` to its source.
 */
export function pipeableRetry<T>(config?: {
      count?: number;
      delay?: number | ((error: any, retryCount: number) => ObservableInput<any>);
      resetOnSuccess?: boolean;
    }): (source: Observable<T>) => Observable<T>;
export function pipeableRetry(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[retry] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
