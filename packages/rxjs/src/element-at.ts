import { create } from './create.js';
import '@rxjs/observable-polyfill';

export const elementAt: unique symbol = Symbol('elementAt');

declare global {
  interface Observable<T> {
    [elementAt](index: number): Observable<T>;
  }
}

Observable.prototype[elementAt] = function <T>(this: Observable<T>, index: number): Observable<T> {
  return this[create]((subscriber) => {
    let count = 0;
    return this.subscribe({
      next: (value) => {
        if (count === index) {
          subscriber.next(value);
          subscriber.complete();
          return;
        }
        count++;
      },
      error: (error) => {
        subscriber.error(error);
      },
      complete: () => {
        subscriber.complete();
      },
    }, { signal: subscriber.signal });
  });
};