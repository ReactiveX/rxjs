// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const defaultIfEmpty: unique symbol = Symbol('defaultIfEmpty');

declare global {
  interface Observable<T> {
    [defaultIfEmpty]: <R>(defaultValue: R) => Observable<T | R>;
  }
}

Observable.prototype[defaultIfEmpty] = function <T, R>(
  this: Observable<T>,
  defaultValue: R
): Observable<T | R> {
  return this[create]((subscriber) => {
    let hasValue = false;
    this.subscribe(
      {
        next: (value) => {
          hasValue = true;
          subscriber.next(value);
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          if (!hasValue) {
            subscriber.next(defaultValue);
          }
          subscriber.complete();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
