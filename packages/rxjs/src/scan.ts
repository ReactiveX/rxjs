import { create } from './create.js';

export const scan: unique symbol = Symbol('scan');

declare global {
  interface Observable<T> {
    [scan]: <R>(reducer: (state: R, value: T, index: number) => R, initialValue: R) => Observable<R>;
  }
}

Observable.prototype[scan] = function <T, R>(
  this: Observable<T>,
  reducer: (state: R, value: T, index: number) => R,
  initialValue: R
): Observable<R> {
  return this[create]((subscriber) => {
    let index = 0;
    let state: R = initialValue;

    this.subscribe(
      {
        next: (value) => {
          try {
            state = reducer(state, value, index++);
          } catch (error) {
            subscriber.error(error);
            return;
          }
          subscriber.next(state);
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
};
