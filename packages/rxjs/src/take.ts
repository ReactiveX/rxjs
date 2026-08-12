import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const take: unique symbol = Symbol('take');

declare global {
  interface Observable<T> {
    [take]: (count: number) => Observable<T>;
  }
}

Observable.prototype[take] = function <T>(this: Observable<T>, count: number): Observable<T> {
  return this[create]((subscriber) => {
    if (count <= 0) {
      subscriber.complete();
      return;
    }

    let seen = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      this,
      subscriber,
      {
        next: (value) => {
          if (++seen <= count) {
            const reachedLimit = count <= seen;
            if (reachedLimit) {
              sourceController.abort();
            }
            subscriber.next(value);
            if (reachedLimit) {
              subscriber.complete();
            }
          }
        },
      },
      sourceController.signal
    );
  });
};
