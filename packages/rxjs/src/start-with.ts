import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const startWith: unique symbol = Symbol('startWith');

declare global {
  interface Observable<T> {
    [startWith]<A extends readonly unknown[]>(...values: A): Observable<T | A[number]>;
  }
}

Observable.prototype[startWith] = function <T, A extends readonly unknown[]>(this: Observable<T>, ...values: A): Observable<T | A[number]> {
  return this[create]((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        return;
      }
      subscriber.next(value);
    }

    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber);
  });
};
