import { create } from './create.js';
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

      this.subscribe(
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
                  const id = setTimeout(innerSub, delay);
                  subscriber.addTeardown(() => clearTimeout(id));
                } else {
                  let result: Observable<any>;

                  try {
                    result = Observable.from(delay(error, retryCount));
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }

                  const notifierController = new AbortController();
                  result.subscribe(
                    {
                      next: () => {
                        notifierController.abort();
                        innerSub();
                      },
                      error: (error) => subscriber.error(error),
                      complete: () => subscriber.complete(),
                    },
                    {
                      signal: AbortSignal.any([subscriber.signal, notifierController.signal]),
                    }
                  );
                }
              } else {
                innerSub();
              }
            } else {
              subscriber.error(error);
            }
          },
          complete: () => subscriber.complete(),
        },
        {
          signal: AbortSignal.any([subscriber.signal, sourceController.signal]),
        }
      );
    };

    innerSub();
  });
};
