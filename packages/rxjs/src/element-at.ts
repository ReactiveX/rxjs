import { create } from './create.js';
import { ArgumentOutOfRangeError } from './argument-out-of-range-error.js';
import '@rxjs/observable-polyfill';
import { subscribeToSource } from './util/observable-helpers.js';

export const elementAt: unique symbol = Symbol('elementAt');

declare global {
  interface Observable<T> {
    [elementAt](index: number): Observable<T>;
    [elementAt]<D>(index: number, defaultValue: D): Observable<T | D>;
  }
}

Observable.prototype[elementAt] = function <T, D>(this: Observable<T>, index: number, ...defaultValue: [] | [D]): Observable<T | D> {
  if (index < 0) {
    throw new ArgumentOutOfRangeError();
  }

  const hasDefault = defaultValue.length === 1;
  return this[create]((subscriber) => {
    let count = 0;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (count === index) {
          subscriber.next(value);
          subscriber.complete();
          return;
        }
        count++;
      },
      complete: () => {
        if (hasDefault) {
          subscriber.next(defaultValue[0]);
          subscriber.complete();
        } else {
          subscriber.error(new ArgumentOutOfRangeError());
        }
      },
    });
  });
};
