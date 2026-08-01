import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const takeWhile: unique symbol = Symbol('takeWhile');

declare global {
  interface Observable<T> {
    [takeWhile]: {
      <R extends T>(predicate: (value: T, index: number) => value is R, config?: { includeLast?: boolean }): Observable<R>;
      (predicate: (value: T, index: number) => boolean, config?: { includeLast?: boolean }): Observable<T>;
    };
  }
}

Observable.prototype[takeWhile] = function <T>(
  this: Observable<T>,
  predicate: (value: T, index: number) => boolean,
  config?: { includeLast?: boolean }
): Observable<T> {
  return this[create]((subscriber) => {
    const { includeLast = false } = config ?? {};
    let index = 0;
    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (predicate(value, index++)) {
          subscriber.next(value);
        } else {
          if (includeLast) {
            subscriber.next(value);
          }
          subscriber.complete();
        }
      },
    });
  });
};
