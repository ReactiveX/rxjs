import { create } from './create.js';

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

    this.subscribe(
      {
        next: (value) => {
          const pair: [T, T] | undefined = hasPrevious ? [previous, value] : undefined;
          previous = value;
          hasPrevious = true;

          if (pair) {
            subscriber.next(pair);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
};
