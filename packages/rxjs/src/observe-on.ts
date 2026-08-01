import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const observeOn: unique symbol = Symbol('observeOn');

declare global {
  interface Observable<T> {
    [observeOn](delay?: number): Observable<T>;
  }
}

Observable.prototype[observeOn] = function <T>(this: Observable<T>, delay = 0): Observable<T> {
  return this[create]((subscriber) => {
    const timers = new Set<ReturnType<typeof globalThis.setTimeout>>();

    const schedule = (work: () => void): void => {
      if (delay === Infinity) {
        return;
      }
      const id = globalThis.setTimeout(() => {
        timers.delete(id);
        if (subscriber.active) {
          work();
        }
      }, delay);
      timers.add(id);
    };

    subscriber.addTeardown(() => {
      for (const id of timers) {
        globalThis.clearTimeout(id);
      }
      timers.clear();
    });

    subscribeToSource(this, subscriber, {
      next: (value) => schedule(() => subscriber.next(value)),
      error: (error) => schedule(() => subscriber.error(error)),
      complete: () => schedule(() => subscriber.complete()),
    });
  });
};
