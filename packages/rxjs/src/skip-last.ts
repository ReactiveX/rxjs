import { create } from './create.js';

export const skipLast: unique symbol = Symbol('skipLast');

declare global {
  interface Observable<T> {
    [skipLast]: (amount?: number) => Observable<T>;
  }
}

Observable.prototype[skipLast] = function <T>(this: Observable<T>, amount = 1): Observable<T> {
  return this[create]((subscriber) => {
    let ring = new Array<T>(amount);
    let seen = 0;
    subscriber.addTeardown(() => {
      ring = null!;
    });

    this.subscribe(
      {
        next: (value) => {
          const valueIndex = seen++;
          if (valueIndex < amount) {
            ring[valueIndex] = value;
          } else {
            const index = valueIndex % amount;
            const oldValue = ring[index];
            ring[index] = value;
            subscriber.next(oldValue);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
};
