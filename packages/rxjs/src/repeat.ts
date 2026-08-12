import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const repeat: unique symbol = Symbol('repeat');

declare global {
  interface Observable<T> {
    [repeat]: (config?: { count?: number; delay?: number | ((repeatCount: number) => ObservableValue<any>) }) => Observable<T>;
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
    if (count <= 0) {
      subscriber.complete();
      return;
    }

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
      subscribeToSource(this, subscriber, {
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
                const notifier = Observable.from(delay(++repeatCount));
                subscribeToSource(
                  notifier,
                  subscriber,
                  {
                    next: () => {
                      innerController.abort();
                      startSub();
                    },
                    complete: () => subscriber.complete(),
                  },
                  innerController.signal
                );
              }
            }
          }
        },
      });
    };

    startSub();
  });
};
