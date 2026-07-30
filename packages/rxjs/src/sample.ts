import { create } from './create.js';

export const sample: unique symbol = Symbol('sample');

declare global {
  interface Observable<T> {
    [sample](notifier: ObservableValue<unknown>): Observable<T>;
  }
}

Observable.prototype[sample] = function <T>(this: Observable<T>, notifier: ObservableValue<unknown>): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;
    let latestValue: T | undefined;

    this.subscribe(
      {
        next: (value) => {
          hasValue = true;
          latestValue = value;
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );

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

    notifications.subscribe(
      {
        next: () => {
          if (hasValue) {
            hasValue = false;
            const value = latestValue as T;
            latestValue = undefined;
            subscriber.next(value);
          }
        },
        error: (error) => subscriber.error(error),
      },
      { signal: subscriber.signal }
    );
  });
};
