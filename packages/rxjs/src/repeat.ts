// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const repeat: unique symbol = Symbol('repeat');

declare global {
  interface Observable<T> {
    [repeat]: (config?: {
      count?: number;
      delay?: number | ((repeatCount: number) => ObservableValue<any>);
    }) => Observable<T>;
  }
}

Observable.prototype[repeat] = function <T>(
  this: Observable<T>,
  config?: {
    count?: number;
    delay?: number | ((repeatCount: number) => ObservableValue<any>);
  }
): Observable<T> {
  return this[create]((subscriber) => {
    const { count = Infinity, delay = null } = config ?? {};

    const nextHandler = (value: T) => subscriber.next(value);
    const errorHandler = (error: any) => subscriber.error(error);
    let id: ReturnType<typeof setTimeout> | undefined;
    let repeatCount = 0;

    const isTimeoutDelay = typeof delay === 'number';
    if (isTimeoutDelay) {
      subscriber.addTeardown(() => clearTimeout(id));
    }

    let remaining = count;
    const startSub = () => {
      this.subscribe(
        {
          next: nextHandler,
          error: errorHandler,
          complete: () => {
            if (remaining === 0) {
              subscriber.complete();
            } else {
              remaining--;
              if (delay == null) {
                startSub();
              } else {
                if (isTimeoutDelay) {
                  id = setTimeout(startSub, delay);
                } else {
                  const innerController = new AbortController();
                  const signal = AbortSignal.any([
                    innerController.signal,
                    subscriber.signal,
                  ]);
                  let notifier: Observable<any>;
                  try {
                    notifier = Observable.from(delay(++repeatCount));
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }
                  notifier.subscribe(
                    {
                      next: () => {
                        innerController.abort();
                        startSub();
                      },
                      error: errorHandler,
                      complete: () => subscriber.complete(),
                    },
                    { signal }
                  );
                }
              }
            }
          },
        },
        { signal: subscriber.signal }
      );
    };

    startSub();
  });
};
