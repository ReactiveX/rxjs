import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const pairwise: unique symbol = Symbol('pairwise');

declare global {
  interface Observable<T> {
    [pairwise]: () => Observable<[T, T]>;
  }
}

Observable.prototype[pairwise] = function <T>(this: Observable<T>): Observable<[T, T]> {
  return this[create]((subscriber) => {
    let previous: T;
    let hasPrevious = false;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const pair: [T, T] | undefined = hasPrevious ? [previous, value] : undefined;
        previous = value;
        hasPrevious = true;

        if (pair) {
          subscriber.next(pair);
        }
      },
    });
  });
};
