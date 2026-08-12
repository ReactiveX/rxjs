import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const delay: unique symbol = Symbol('delay');

declare global {
  interface Observable<T> {
    [delay]: (due: number | Date) => Observable<T>;
  }
}

Observable.prototype[delay] = function <T>(this: Observable<T>, due: number | Date): Observable<T> {
  return this[create]((subscriber) => {
    const timers = new Set<ReturnType<typeof globalThis.setTimeout>>();
    let sourceCompleted = false;

    const completeIfSettled = () => {
      if (sourceCompleted && timers.size === 0) {
        subscriber.complete();
      }
    };

    subscriber.addTeardown(() => {
      for (const timer of timers) {
        globalThis.clearTimeout(timer);
      }
      timers.clear();
    });

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const duration = Math.max(0, due instanceof globalThis.Date ? +due - globalThis.Date.now() : due);
        const timer = globalThis.setTimeout(() => {
          timers.delete(timer);
          if (subscriber.active) {
            subscriber.next(value);
            completeIfSettled();
          }
        }, duration);
        timers.add(timer);
      },
      complete: () => {
        sourceCompleted = true;
        completeIfSettled();
      },
    });
  });
};
