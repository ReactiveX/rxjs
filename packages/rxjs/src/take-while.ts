import { create } from './create.js';

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
    this.subscribe(
      {
        next: (value) => {
          let result: boolean;
          try {
            result = predicate(value, index++);
          } catch (error) {
            subscriber.error(error);
            return;
          }

          if (result) {
            subscriber.next(value);
          } else {
            if (includeLast) {
              subscriber.next(value);
            }
            subscriber.complete();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};
