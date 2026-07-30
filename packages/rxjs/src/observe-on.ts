import { create } from './create.js';

export const observeOn: unique symbol = Symbol('observeOn');

declare global {
  interface Observable<T> {
    [observeOn](delay?: number): Observable<T>;
  }
}

Observable.prototype[observeOn] = function <T>(this: Observable<T>, delay = 0): Observable<T> {
  return this[create]((subscriber) => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const schedule = (work: () => void): void => {
      if (delay === Infinity) {
        return;
      }
      const id = setTimeout(() => {
        timers.delete(id);
        if (subscriber.active) {
          work();
        }
      }, delay);
      timers.add(id);
    };

    subscriber.addTeardown(() => {
      for (const id of timers) {
        clearTimeout(id);
      }
      timers.clear();
    });

    this.subscribe(
      {
        next: (value) => schedule(() => subscriber.next(value)),
        error: (error) => schedule(() => subscriber.error(error)),
        complete: () => schedule(() => subscriber.complete()),
      },
      { signal: subscriber.signal }
    );
  });
};
