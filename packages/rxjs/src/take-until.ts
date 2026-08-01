import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const takeUntil: unique symbol = Symbol('takeUntil');

declare global {
  interface Observable<T> {
    [takeUntil](notifier: ObservableValue<any>): Observable<T>;
  }
}

Observable.prototype[takeUntil] = function <T>(this: Observable<T>, notifier: ObservableValue<any>): Observable<T> {
  return this[create]((subscriber) => {
    let notifierSource: Observable<any>;
    try {
      notifierSource = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(notifierSource, subscriber, { next: () => subscriber.complete(), complete: () => void 0 });

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber);
  });
};
