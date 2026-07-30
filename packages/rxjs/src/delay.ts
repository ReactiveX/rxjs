import { create } from './create.js';

export const delay: unique symbol = Symbol('delay');

declare global {
  interface Observable<T> {
    [delay]: (due: number | Date) => Observable<T>;
  }
}

Observable.prototype[delay] = function <T>(this: Observable<T>, due: number | Date): Observable<T> {
  return this[create]((subscriber) => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let sourceCompleted = false;

    const completeIfSettled = () => {
      if (sourceCompleted && timers.size === 0) {
        subscriber.complete();
      }
    };

    subscriber.addTeardown(() => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
      timers.clear();
    });

    this.subscribe(
      {
        next: (value) => {
          const duration = Math.max(0, due instanceof Date ? +due - Date.now() : due);
          let timer: ReturnType<typeof setTimeout>;
          try {
            timer = setTimeout(() => {
              timers.delete(timer);
              if (subscriber.active) {
                subscriber.next(value);
                completeIfSettled();
              }
            }, duration);
          } catch (error) {
            subscriber.error(error);
            return;
          }
          timers.add(timer);
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          sourceCompleted = true;
          completeIfSettled();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
