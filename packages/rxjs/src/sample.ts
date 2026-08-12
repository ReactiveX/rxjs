import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        latestValue = value;
      },
    });

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

    subscribeToSource(notifications, subscriber, {
      next: () => {
        if (hasValue) {
          hasValue = false;
          const value = latestValue as T;
          latestValue = undefined;
          subscriber.next(value);
        }
      },
      complete: () => void 0,
    });
  });
};
