import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';
import '@rxjs/observable-polyfill';

export const retry: unique symbol = Symbol('retry');

declare global {
  interface Observable<T> {
    [retry](config?: {
      count?: number;
      delay?: number | ((error: any, retryCount: number) => ObservableValue<any>);
      resetOnSuccess?: boolean;
    }): Observable<T>;
  }
}

Observable.prototype[retry] = function <T>(
  this: Observable<T>,
  config?: {
    count?: number;
    delay?: null | number | ((error: any, retryCount: number) => ObservableValue<any>);
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
