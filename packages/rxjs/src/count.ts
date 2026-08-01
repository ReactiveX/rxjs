import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const count: unique symbol = Symbol('count');

declare global {
  interface Observable<T> {
    [count]: (predicate?: (value: T, index: number) => boolean) => Observable<number>;
  }
}

Observable.prototype[count] = function <T>(this: Observable<T>, predicate?: (value: T, index: number) => boolean): Observable<number> {
  return this[create]((subscriber) => {
    let total = 0;
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (!predicate) {
          total++;
          return;
        }

        if (predicate(value, index++)) {
          total++;
        }
      },
      complete: () => {
        subscriber.next(total);
        subscriber.complete();
      },
    });
  });
};
