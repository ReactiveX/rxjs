import { create } from './create.js';

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

    this.subscribe(
      {
        next: (value) => {
          if (skipping) {
            try {
              skipping = predicate(value, index++);
            } catch (error) {
              subscriber.error(error);
              return;
            }
          }

          if (!skipping) {
            subscriber.next(value);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
};
