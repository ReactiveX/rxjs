import { create } from './create.js';

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
        this.subscribe(subscriber, { signal: subscriber.signal });
      }
    }, delay);
    subscriber.addTeardown(() => globalThis.clearTimeout(id));
  });
};
