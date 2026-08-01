import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skipWhile: unique symbol = Symbol('skipWhile');

declare global {
  interface Observable<T> {
    [skipWhile]: {
      <R extends T>(predicate: (value: T, index: number) => value is R): Observable<Exclude<T, R>>;
      (predicate: (value: T, index: number) => boolean): Observable<T>;
    };
  }
}

Observable.prototype[skipWhile] = function <T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;
    let skipping = true;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (skipping) {
          skipping = predicate(value, index++);
        }

        if (!skipping) {
          subscriber.next(value);
        }
      },
    });
  });
};
