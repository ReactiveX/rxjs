import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const subscribeOn: unique symbol = Symbol('subscribeOn');

declare global {
  interface Observable<T> {
    [subscribeOn](delay?: number): Observable<T>;
  }
}

Observable.prototype[subscribeOn] = function <T>(this: Observable<T>, delay = 0): Observable<T> {
  return this[create]((subscriber) => {
    if (delay === Infinity) {
      return;
    }

    const id = globalThis.setTimeout(() => {
      if (subscriber.active) {
        subscribeToSource(this, subscriber);
      }
    }, delay);
    subscriber.addTeardown(() => globalThis.clearTimeout(id));
  });
};
