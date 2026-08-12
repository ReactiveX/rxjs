import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const distinct: unique symbol = Symbol('distinct');

declare global {
  interface Observable<T> {
    [distinct]: <K = T>(keySelector?: (value: T) => K, flushes?: ObservableValue<any>) => Observable<T>;
  }
}

Observable.prototype[distinct] = function <T, K = T>(
  this: Observable<T>,
  keySelector?: (value: T) => K,
  flushes?: ObservableValue<any>
): Observable<T> {
  return this[create]((subscriber) => {
    const keys = new Set<K | T>();

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const key = keySelector ? keySelector(value) : value;
        if (!keys.has(key)) {
          keys.add(key);
          subscriber.next(value);
        }
      },
    });

    if (!subscriber.active || !flushes) {
      return;
    }

    let flushSource: Observable<any>;
    try {
      flushSource = Observable.from(flushes);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(flushSource, subscriber, { next: () => keys.clear(), complete: () => void 0 });
  });
};
