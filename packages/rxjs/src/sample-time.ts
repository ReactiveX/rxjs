import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        latestValue = value;
      },
    });

    if (!subscriber.active) {
      return;
    }

    const id = globalThis.setInterval(() => {
      if (hasValue) {
        hasValue = false;
        subscriber.next(latestValue);
      }
    }, period);
    subscriber.addTeardown(() => globalThis.clearInterval(id));
  });
};
