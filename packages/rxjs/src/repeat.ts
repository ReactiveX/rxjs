import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const repeat: unique symbol = Symbol('repeat');

declare global {
  interface Observable<T> {
    [repeat]: (config?: { count?: number; delay?: number | ((repeatCount: number) => ObservableValue<any>) }) => Observable<T>;
  }
}

installObservableExtension({
  instance: function <T>(
    this: Observable<T>,
    config?: {
      count?: number;
      delay?: number | ((repeatCount: number) => ObservableValue<any>);
    }
  ): Observable<T> {
    return this[create]((subscriber) => {
      const { count = Infinity, delay = null } = config ?? {};
      if (count <= 0) {
        subscriber.complete();
        return;
      }

      const nextHandler = (value: T) => subscriber.next(value);
      const errorHandler = (error: any) => subscriber.error(error);
      let id: ReturnType<typeof globalThis.setTimeout> | undefined;
      let repeatCount = 0;
      let subscriptionCount = 0;

      const isTimeoutDelay = typeof delay === 'number';
      if (isTimeoutDelay) {
        subscriber.addTeardown(() => globalThis.clearTimeout(id));
      }

      const startSub = () => {
        if (!subscriber.active) {
          return;
        }
        subscriptionCount++;
        this.subscribe(
          {
            next: nextHandler,
            error: errorHandler,
            complete: () => {
              if (subscriptionCount >= count) {
                subscriber.complete();
              } else {
                if (delay == null) {
                  startSub();
                } else {
                  if (isTimeoutDelay) {
                    id = globalThis.setTimeout(startSub, delay);
                  } else {
                    const innerController = new AbortController();
                    const signal = AbortSignal.any([innerController.signal, subscriber.signal]);
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
  },
  name: 'repeat',
  symbol: repeat,
});
