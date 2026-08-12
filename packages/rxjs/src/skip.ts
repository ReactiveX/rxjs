import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const skip: unique symbol = Symbol('skip');

declare global {
  interface Observable<T> {
    [skip]: (count: number) => Observable<T>;
  }
}

Observable.prototype[skip] = function <T>(this: Observable<T>, count: number): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (count <= index++) {
          subscriber.next(value);
        }
      },
    });
  });
};
