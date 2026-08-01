import { create } from './create.js';

export const take: unique symbol = Symbol('take');

declare global {
  interface Observable<T> {
    [take]: (count: number) => Observable<T>;
  }
}

Observable.prototype[take] = function <T>(this: Observable<T>, count: number): Observable<T> {
  return this[create]((subscriber) => {
    if (count <= 0) {
      subscriber.complete();
      return;
    }

    let seen = 0;
    const sourceController = new AbortController();
    this.subscribe(
      {
        next: (value) => {
          if (++seen <= count) {
            const reachedLimit = count <= seen;
            if (reachedLimit) {
              sourceController.abort();
            }
            subscriber.next(value);
            if (reachedLimit) {
              subscriber.complete();
            }
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: AbortSignal.any([subscriber.signal, sourceController.signal]) }
    );
  });
};
