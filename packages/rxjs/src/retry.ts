// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';
import './observable-polyfill';

export const retry: unique symbol = Symbol('retry');

declare global {
  interface Observable<T> {
    [retry](config?: {
      count?: number;
      delay?:
        | number
        | ((error: any, retryCount: number) => ObservableValue<any>);
      resetOnSuccess?: boolean;
    }): Observable<T>;
  }
}

Observable.prototype[retry] = function <T>(
  this: Observable<T>,
  config?: {
    count?: number;
    delay?:
      | null
      | number
      | ((error: any, retryCount: number) => ObservableValue<any>);
    resetOnSuccess?: boolean;
  }
) {
  const {
    count = Infinity,
    delay = null,
    resetOnSuccess = true,
  } = config ?? {};

  return this[create]((subscriber) => {
    let retriesRemaining = count;
    let innerController: AbortController | null = null;

    const innerSub = () => {
      innerController = new AbortController();

      this.subscribe(
        {
          next: (value) => {
            if (resetOnSuccess) {
              retriesRemaining = count;
            }
            subscriber.next(value);
          },
          error: (error) => {
            if (innerController) {
              innerController.abort();
              innerController = null;
            }

            if (retriesRemaining > 0) {
              retriesRemaining--;
              if (delay !== null) {
                if (typeof delay === 'number') {
                  const id = setTimeout(innerSub, delay);
                  subscriber.addTeardown(() => clearTimeout(id));
                } else {
                  let result: Observable<any>;

                  try {
                    result = Observable.from(
                      delay(error, count - retriesRemaining)
                    );
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }

                  result.subscribe(
                    {
                      next: () => {
                        innerController?.abort();
                        innerController = null;
                        innerSub();
                      },
                      error: (error) => subscriber.error(error),
                      complete: () => subscriber.complete(),
                    },
                    { signal: subscriber.signal }
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
          signal: AbortSignal.any([subscriber.signal, innerController.signal]),
        }
      );
    };

    innerSub();
  });
};
