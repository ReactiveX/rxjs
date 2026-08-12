import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skipUntil: unique symbol = Symbol('skipUntil');

declare global {
  interface Observable<T> {
    [skipUntil]: (notifier: ObservableValue<any>) => Observable<T>;
  }
}

Observable.prototype[skipUntil] = function <T>(this: Observable<T>, notifier: ObservableValue<any>): Observable<T> {
  return this[create]((subscriber) => {
    let taking = false;
    const notifierController = new AbortController();
    subscriber.addTeardown(() => notifierController.abort(subscriber.signal.reason));

    let notifierSource: Observable<any>;
    try {
      notifierSource = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(
      notifierSource,
      subscriber,
      {
        next: () => {
          notifierController.abort();
          taking = true;
        },
        complete: () => void 0,
      },
      notifierController.signal
    );

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (taking) {
          subscriber.next(value);
        }
      },
    });
  });
};
