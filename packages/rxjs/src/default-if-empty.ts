import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const defaultIfEmpty: unique symbol = Symbol('defaultIfEmpty');

declare global {
  interface Observable<T> {
    [defaultIfEmpty]: <R>(defaultValue: R) => Observable<T | R>;
  }
}

Observable.prototype[defaultIfEmpty] = function <T, R>(this: Observable<T>, defaultValue: R): Observable<T | R> {
  return this[create]((subscriber) => {
    let hasValue = false;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        subscriber.next(value);
      },
      complete: () => {
        if (!hasValue) {
          subscriber.next(defaultValue);
        }
        subscriber.complete();
      },
    });
  });
};
