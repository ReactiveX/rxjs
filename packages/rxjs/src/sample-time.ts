import { create } from './create.js';

export const sampleTime: unique symbol = Symbol('sampleTime');

declare global {
  interface Observable<T> {
    [sampleTime]: (period: number) => Observable<T>;
  }
}

Observable.prototype[sampleTime] = function <T>(this: Observable<T>, period: number): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;
    let latestValue: T;

    this.subscribe(
      {
        next: (value) => {
          hasValue = true;
          latestValue = value;
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );

    if (!subscriber.active) {
      return;
    }

    const id = setInterval(() => {
      if (hasValue) {
        hasValue = false;
        subscriber.next(latestValue);
      }
    }, period);
    subscriber.addTeardown(() => clearInterval(id));
  });
};
